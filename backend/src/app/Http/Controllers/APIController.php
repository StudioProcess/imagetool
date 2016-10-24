<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

use App\Http\Requests;

use JWTAuth, File, Validator, Imagick, ImagickPixel, ImagickDraw, ZipArchive;


class APIController extends Controller {

	public function add_images(Request $request) {

		$bigSize = env('IMAGE_SIZE_LARGE', 1000);
		$smallSize = env('IMAGE_SIZE_SMALL', 300);

		$user = JWTAuth::toUser(); // NOTE: DB access
		$tempPath = 'temp/'.$user['id'];
		$destinationPath = 'images/'.$user['id'];

		// check if image
		$validator = Validator::make(
		    ['images' => $request['images']],
			['images.*' => ['image']]
		);
		if ($validator->fails()) {
			return response()->json([
					'status' => 'error',
					'message' => 'Add images; File(s) must be an image.'
				], 400);  // Error: 'Bad Request'
		}

		// create user directory if it doesnt exist
		if(!File::exists($tempPath)) {
		    File::makeDirectory($tempPath, $mode = 0777, true, true);
		}
		if(!File::exists($destinationPath)) {
		    File::makeDirectory($destinationPath, $mode = 0777, true, true);
		}

		$total_upload_success = true;

		$new_images = [];

		if ($request->hasFile('images')) {
			$files = $request->file('images');
			
			$image_id = -1;
			// NOTE: DB access
			DB::transaction(function () use ($files, &$image_id) {
				$user = JWTAuth::toUser();
				$image_id = $user->latest_loginstat->uploads; // initially holds last used image id
				$user->latest_loginstat->increment('uploads', count($files));
			});
			
			foreach($files as $file){
				$image_id++;
				
				$originalname = $file->getClientOriginalName();
				$filename = pathinfo($originalname, PATHINFO_FILENAME);
				$extension = pathinfo($originalname, PATHINFO_EXTENSION);
				$imagename = sprintf('%03d', $image_id)."_".$filename;

				$upload_success = $file->move($tempPath, $imagename.".".$extension);
				
				$new_images = [];

				if ($upload_success) {

					$imagick = new Imagick(public_path()."/".$tempPath."/".$imagename.".".$extension);
					
					// Immediately resize to 'IMAGE_SIZE_LARGE'
					if ( $imagick->getImageWidth() > $bigSize || $imagick->getImageHeight() > $bigSize ) {
						$imagick->resizeImage($bigSize, $bigSize, imagick::FILTER_CATROM, 1, true);
					}
					
					// Use sRGB color space
					$imagick->transformImageColorspace(imagick::COLORSPACE_SRGB);
					
					// Enhance Option 1: Normalize + Autogamma
					$imagick->normalizeImage(); // The intensity values are stretched to cover the entire range of possible values. While doing so, black-out at most 2% of the pixels and white-out at most 1% of the pixels.
					// $imagick->autoLevelImage(); // Like normalize without clipping
					$imagick->autoGammaImage(); // Auto gamma
					
					// Enhance Option 2: Sigmoidal contrast
					// Parameter sharpen (bool) If true increase the contrast, if false decrease the contrast.
					// Parameter alpha (float) The amount of contrast to apply. 1 is very little, 5 is a significant amount, 20 is extreme.
					$imagick->sigmoidalContrastImage(true, 3, 0.5*Imagick::getQuantum());

					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-full.".$extension);

					$imagick->resizeImage($smallSize, $smallSize, imagick::FILTER_CATROM, 1, true);
					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-thumb.".$extension);

					$imagick->clear();
					$imagick->destroy();

					$new_image = array(
							'id' => $image_id,
							'name' => $imagename,
							'extension' => $extension,
							'urls' => array(
									'full' => url('api/public/'.$destinationPath."/".$imagename."-full.".$extension),
									'thumb' => url('api/public/'.$destinationPath."/".$imagename."-thumb.".$extension)
								)
						);
					$new_images[] = $new_image;

					File::cleanDirectory($tempPath);

				} else {
					// $user->latest_loginstat->decrement('uploads'); // NOTE: DB access
					$total_upload_success = false;
				}
			}
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Add images; No file(s) given.'
				], 400);
		}
		
		// Atomically update models // NOTE: DB access
		DB::transaction(function () use ($new_images) {
			// $user->fresh(); // reload user data
			$user = JWTAuth::toUser(); // reload user data at this point in time
			$uploaded_images = json_decode($user->last_uploaded_images, true);
			if ( is_null($uploaded_images) ) $uploaded_images = [];
			$uploaded_images = array_merge($uploaded_images, $new_images);
			$uploaded_images_json = json_encode($uploaded_images);
			$user->last_uploaded_images = $uploaded_images_json;
			$user->save();
		});

		if ($total_upload_success) {
			// $new_token = JWTAuth::refresh($request->input('token'));
			return response()->json(
				[
					'status' => 'success',
					'message' => 'Add images; Image(s) uploaded.',
					'data' =>
						[
							'images' => $new_images
						],
					// 'token' => $new_token
				], 200);
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Add images; There was an processing the upload.'
				], 500);
		}

	}
	
	public static function addVignette($imagick) {
		// Vignette FIXME: too slow
		$diagonal = sqrt(pow($imagick->getImageWidth(),2) + pow($imagick->getImageHeight(),2));
		$imagick->setImageBackgroundColor("black");
		$imagick->vignetteImage(-100, -100, 0, 0);
	}

	public function remove_image(Request $request) {

		$user = JWTAuth::toUser($request->input('token'));
		$uploaded_images = json_decode($user->last_uploaded_images, true);
		$image_id = $request->input('image_id');
		$found = false;

		if ( empty($image_id) ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Remove image; No image_id given.'
				], 400);
		}

		if ( empty($uploaded_images) ) {
			return response()->json(
					[
						'status' => 'error',
						'message' => 'Remove image; No images present.'
					], 404); // Error 'Not found'
		}

		foreach($uploaded_images as $image_key => $image){
			if ( $image['id'] == $image_id ) {
				$found = true;
				$destinationPath = 'images/'.$user['id'];
				$imagename = $image['name'];
				$extension = $image['extension'];
				File::delete($destinationPath."/".$imagename."-full.".$extension);
				File::delete($destinationPath."/".$imagename."-thumb.".$extension);
				File::delete($destinationPath."/".$imagename."-cover-full.".$extension);
				File::delete($destinationPath."/".$imagename."-cover-thumb.".$extension);
				unset($uploaded_images[$image_key]);
				$uploaded_images = array_values($uploaded_images); // reindex so we preserve array characteristics in JSON (would be object otherwise)
				break;
			}
		}

		if ( !$found ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Remove image; image_id not found.'
				], 404);
		}

		$uploaded_images_json = json_encode($uploaded_images);
		$user->last_uploaded_images = $uploaded_images_json;
		$user->save();

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Remove image; Images removed.',
				'data' =>
					[
						'images' => $uploaded_images
					],
				// 'token' => $new_token
			], 200);

	}

	public function get_images(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ( empty($uploaded_images) ) {
			$uploaded_images = [];
		}

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get images; List of images.',
				'data' =>
					[
						'images' => $uploaded_images
					],
				// 'token' => $new_token
			], 200);

	}

	public function set_cover(Request $request) {

		$user = JWTAuth::toUser($request['token']);
		$uploaded_images = json_decode($user->last_uploaded_images, true);

		if ( empty($uploaded_images) ) {
			return response()->json(
					[
						'status' => 'error',
						'message' => 'Set cover; No images present.'
					], 404);
		}

		$image_id = $request->input('image_id');
		if ( empty($image_id) ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Set cover; No image_id given.'
				], 400);
		}

		$found = false;
		foreach($uploaded_images as $image_key => $image){
			if ( $image['id'] == $image_id ) {
				$found = true;
			}
		}

		if ( !$found ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Set cover; image_id not found.'
				], 404);
		}
		
		
		$cover_defaults = [
			'brand_logo' => '',
			'sticker_text' => '',
			'sticker_form' => '' // circle, square or badge (=default)
		];
		$cover_settings = $request->except(['token']);
		$cover_settings = array_replace_recursive($cover_defaults, $cover_settings);
		
		// Delete old cover file
		$old_cover_settings = json_decode($user->cover_settings, true);
		$old_cover_id = $old_cover_settings['image_id'];
		$old_cover = array_reduce($uploaded_images, function($carry, $image) use ($old_cover_id) {
			if ($image['id'] == $old_cover_id) return $image;
			return $carry;
		});
		if (!is_null($old_cover)) {
			$destinationPath = 'images/'.$user['id'];
			$imagename = $old_cover['name'];
			$extension = $old_cover['extension'];
			File::delete($destinationPath."/".$imagename."-cover-full.".$extension);
			File::delete($destinationPath."/".$imagename."-cover-thumb.".$extension);
		}

		$coverUrls = false;
		$coverError = null;
		try {
			$coverUrls = APIController::processCover($cover_settings, $uploaded_images, $user);
		} catch (\Exception $e) {
			$coverError = $e;
		}
		
		// $coverUrl = null;
		
		if ( !$coverUrls ) {
			$response = [
				'status' => 'error',
				'message' => 'Set cover; There was an error processing the cover.',
				'cover_settings' => $cover_settings
				
			];
			if ( $coverError ) {
				$response['exception'] = [
					'message' => $coverError->getMessage(),
					'code' => $coverError->getCode(),
					'file' => $coverError->getFile(),
					'line' => $coverError->getLine()
				];
			}
			return response()->json($response, 500);
		}

		// save cover settings
		$user->cover_settings = json_encode($cover_settings);
		$user->save();

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Set cover; Cover generated.',
				'data' =>
					[
						'cover_settings' => json_decode($user->cover_settings),
						'cover_urls' => $coverUrls
					],
				// 'token' => $new_token
			], 200);

	}
	
	public static function drawBadge($draw, $width) {
		// NOTE: canvas is 1000 x 1000
		$points="500,50 552.3,2.7 593.6,59.8 654.5,24.5 683,88.9 750,67 764.5,135.9 834.6,128.4 834.4,198.9 
			904.5,206.1 889.7,275 956.8,296.6 928,360.9 989.1,396 947.5,453 1000,500 947.5,547 989.1,604 928,639.1 956.8,703.4 889.7,725 
			904.5,793.9 834.4,801.1 834.6,871.6 764.5,864.1 750,933 683,911.1 654.5,975.5 593.6,940.2 552.3,997.3 500,950 447.7,997.3 
			406.4,940.2 345.5,975.5 317,911.1 250,933 235.5,864.1 165.4,871.6 165.6,801.1 95.5,793.9 110.3,725 43.2,703.4 72,639.1 
			10.9,604 52.5,547 0,500 52.5,453 10.9,396 72,360.9 43.2,296.6 110.3,275 95.5,206.1 165.6,198.9 165.4,128.4 235.5,135.9 250,67 
			317,88.9 345.5,24.5 406.4,59.8 447.7,2.7";

		$points = array_map(function ($str) use ($width) {
			$p = explode(',', trim($str));
			return [ 'x' => floatval($p[0])*$width/1000, 'y' => floatval($p[1])*$width/1000 ];
		}, explode(' ', $points));
		
		$draw->polygon($points);
	}
	
	public static function parseGravityToVector($str, $width, $height) {
		$v = [0, 0];
		switch ( strtolower($str) ) {
			case strtolower('NorthWest'):
			case strtolower('TopLeft'):
				$v = [0, 0];
				break;
			case strtolower('North'):
			case strtolower('Top'):
				$v = [$width/2, 0];
				break;
			case strtolower('NorthEast'):
			case strtolower('TopRight'):
				$v = [$width-1, 0];
				break;
			case strtolower('West'):
			case strtolower('Left'):
				$v = [0, $height/2];
				break;
			case strtolower('Center'):
			case strtolower('Middle'):
				$v = [$width/2, $height/2];
				break;
			case strtolower('East'):
			case strtolower('Right'):
				$v = [$width-1, $height/2];
				break;
			case strtolower('SouthWest'):
			case strtolower('BottomLeft'):
				$v = [0, $height-1];
				break;
			case strtolower('South'):
			case strtolower('Bottom'):
				$v = [$width/2, $height-1];
				break;
			case strtolower('SouthEast'):
			case strtolower('BottomRight'):
				$v = [$width-1, $height-1];
				break;
			default:
				$v = null;
				break;
		}
		if (is_null($v)) return null;
		return $v[0] . ',' . $v[1];
	}
	
	public static function parseDirectionToVector($str, $width, $height) {
		$parts = explode('-', $str);
		if (count($parts) == 2) {
			$v1 = APIController::parseGravityToVector($parts[0], $width, $height);
			$v2 = APIController::parseGravityToVector($parts[1], $width, $height);
			if ( !is_null($v1) && !is_null($v2) ) {
				return $v1 . ',' . $v2;
			}
		}
		return '0,0,0,'. $height;
	}
	
	public static function processCover($cover_settings, $uploaded_images, $user) {
		$source_image = null;
		$found = false;
		foreach($uploaded_images as $image_key => $image){
			if ( $image['id'] == $cover_settings['image_id'] ) {
				$found = true;
				$source_image = $image;
			}
		}
		if ( !$found ) { return false; }

		$destinationPath = 'images/'.$user['id'];
		$imagename = $source_image['name'];
		$extension = $source_image['extension'];
		
		$imagick = new Imagick(public_path()."/".$destinationPath."/".$imagename."-full.".$extension);
		$image_width = $imagick->getImageWidth();
		$image_height = $imagick->getImageHeight();
		
		$border_width = env('BORDER_WIDTH', 40);
		$logo_height = env('LOGO_HEIGHT', 80);
		$eyecatcher_size = env('STICKER_SIZE', 250);
		
		$colors = json_decode($user['theme_color']);
		$border_color1 = isset($colors->border1) ? $colors->border1 : 'black';
		$border_color2 = isset($colors->border2) ? $colors->border2 : '';
		$border_option = 'gradient:angle';
		$border_value = 180;
		if ( isset($colors->borderAngle) ) {
			$border_value = intval($colors->borderAngle) + 180;
		} else if ( isset($colors->borderDirection) ) {
			$border_option = 'gradient:vector';
			$border_value = APIController::parseDirectionToVector($colors->borderDirection, $image_width, $image_height);
		}
		$eyecatcher_color1 = isset($colors->sticker1) ? $colors->sticker1 : 'black';
		$eyecatcher_color2 = isset($colors->sticker2) ? $colors->sticker2 : '';
		$eyecatcher_option = 'gradient:angle';
		$eyecatcher_value = 180;
		if ( isset($colors->stickerAngle) ) {
			$border_value = intval($colors->stickerAngle) + 180;
		} else if ( isset($colors->stickerDirection) ) {
			$eyecatcher_option = 'gradient:vector';
			$eyecatcher_value = APIController::parseDirectionToVector($colors->stickerDirection, $eyecatcher_size, $eyecatcher_size);
		}
		$text_color = isset($colors->stickerText) ? $colors->stickerText : 'black';

		$logos_brand = $cover_settings['brand_logo'];
		$eyecatcher_text = $cover_settings['sticker_text'];
		$eyecatcher_form = $cover_settings['sticker_form'];

		// Set border
		if ($border_color2 == "") {
			$color = new ImagickPixel($border_color1);
			$imagick->borderImage($color, $border_width, $border_width);
		} else {
			$gradient = new Imagick();
			$gradient->setOption($border_option, $border_value);
			$gradient->newPseudoImage($image_width+$border_width*2, $image_height+$border_width*2, "gradient:".$border_color1."-".$border_color2);
			$gradient->compositeImage( $imagick, imagick::COMPOSITE_OVER, $border_width, $border_width);
			$imagick = clone $gradient;
			$gradient->clear();
			$gradient->destroy();
		}

		$image_width = $imagick->getImageWidth();
		$image_height = $imagick->getImageHeight();
		
		
		// Place logos
		$brand_missing = empty($logos_brand) || $logos_brand == 'none' || $logos_brand == 'n/a';
		$userlogo = new Imagick(public_path()."/user-logos/".str_slug($user->id, '_').".png");
		$userlogo->resizeImage(9999, $logo_height, imagick::FILTER_CATROM, 1, true);
		
		if (!$brand_missing) {
			$brandlogo = new Imagick(public_path()."/brand-logos/".str_slug($logos_brand, '_').".png");
			$brandlogo->resizeImage(9999, $logo_height, imagick::FILTER_CATROM, 1, true);
		}
		
		$logo_spacing = env('LOGO_SPACING', 20);
		$logo_compound_width = $userlogo->getImageWidth() + $logo_spacing;
		if (!$brand_missing) { $logo_compound_width += $brandlogo->getImageWidth(); }
		$logo_compound = new Imagick();
		$logo_compound->newImage($logo_compound_width, $logo_height, 'transparent');
		$logo_compound->compositeImage( $userlogo, imagick::COMPOSITE_OVER, 0, 0);
		if (!$brand_missing) {
			$logo_compound->compositeImage( $brandlogo, imagick::COMPOSITE_OVER, $userlogo->getImageWidth() + $logo_spacing, 0);
		}
		
		$userlogo->clear();
		$userlogo->destroy();
		if (!$brand_missing) {
			$brandlogo->clear();
			$brandlogo->destroy();
		}

		$offset = env('LOGO_OFFSET', 60);
		$offset_x = $offset;
		$offset_y = $image_height - $offset - $logo_height;

		$imagick->compositeImage( $logo_compound, imagick::COMPOSITE_OVER, $offset_x, $offset_y);

		// Place eye catcher
		if ( !empty($eyecatcher_text) ) {
			$draw = new ImagickDraw();
			$draw->setStrokeOpacity(1);
			$draw->setStrokeColor('white');
			$draw->setFillColor('white');

			$offset = env('STICKER_OFFSET', 10);
			$offset_x = $image_width - ($offset+$eyecatcher_size);
			$offset_y = $offset;
			
			if ($eyecatcher_form == "circle") {
				$draw->circle($eyecatcher_size / 2, $eyecatcher_size / 2, $eyecatcher_size, $eyecatcher_size / 2);
			} else if ($eyecatcher_form == "square") {
				$draw->rectangle(0, 0, $eyecatcher_size, $eyecatcher_size);
			} else {
				APIController::drawBadge($draw, $eyecatcher_size);
			}
			
			$mask = new Imagick();
			$mask->newPseudoImage($eyecatcher_size, $eyecatcher_size, "canvas:transparent");
			$mask->drawImage($draw);
			
			$eyecatcher = new Imagick();
			$eyecatcher->setOption($eyecatcher_option, $eyecatcher_value);
			$eyecatcher->newPseudoImage($eyecatcher_size, $eyecatcher_size, "gradient:" . $eyecatcher_color1 . "-" . $eyecatcher_color2);
			$eyecatcher->compositeImage($mask, imagick::COMPOSITE_COPYOPACITY, 0, 0);
			
			$imagick->compositeImage($eyecatcher, imagick::COMPOSITE_OVER, $offset_x, $offset_y);

			// Add text
			$text_img = new Imagick();
			$text_img->setBackgroundColor('transparent');
			$text_img->setOption('fill', $text_color);
			$text_img->setOption('interline-spacing', -40);
			$text_img->setFont('fonts/Anton.ttf');
			$text_img->setGravity(imagick::GRAVITY_CENTER);
			
			$scale = 0.70;
			$supersample = 2.5;
			$centering_offset = (1-$scale)/2 * $eyecatcher_size;
			$text_img->newPseudoImage($eyecatcher_size*$supersample*$scale, $eyecatcher_size*$supersample*$scale, 'caption:' . $eyecatcher_text);
			$text_img->resizeImage($eyecatcher_size*$scale, $eyecatcher_size*$scale, imagick::FILTER_CATROM, 1, true);
			$imagick->compositeImage($text_img, imagick::COMPOSITE_OVER, $offset_x+$centering_offset, $offset_y+$centering_offset);
		}

		// Write file
		$url_full = $destinationPath."/".$imagename."-cover-full.".$extension;
		$url_thumb = $destinationPath."/".$imagename."-cover-thumb.".$extension;
		$imagick->writeImage(public_path()."/".$url_full);
		$smallsize = env('IMAGE_SIZE_SMALL', 300);
		$imagick->resizeImage($smallsize, $smallsize, imagick::FILTER_CATROM, 1, true);
		$imagick->writeImage(public_path()."/".$url_thumb);
		$imagick->clear();
		$imagick->destroy();

		return ['thumb' => url('api/public/'.$url_thumb), 'full' => url('api/public/'.$url_full)];
	}

	public function get_cover_settings(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ( empty($uploaded_images) ) $uploaded_images = [];
		// if ( empty($uploaded_images) ) {
		// 	return response()->json(
		// 			[
		// 				'status' => 'error',
		// 				'message' => 'Get cover settings; No images present.'
		// 			], 404);
		// }

		$cover_settings = json_decode($user['cover_settings'], true);
		if ( empty($cover_settings) ) $cover_settings = (object)[];
		// if (empty($cover_settings)) {
		// 	return response()->json(
		// 		[
		// 			'status' => 'error',
		// 			'message' => 'Get cover settings; No cover specified.'
		// 		], 400);
		// }

		$source_image = null;
		$found = false;
		if ( !empty((array)$cover_settings) ) {
			foreach($uploaded_images as $image){
				if ( $image['id'] == $cover_settings['image_id'] ) {
					$found = true;
					$source_image = $image;
				}
			}
		}
		
		// TODO: this is redundant, remove:
		// $found = false;
		// foreach($uploaded_images as $image){
		// 	if ( $image['id'] == $cover_settings['image_id'] ) {
		// 		$found = true;
		// 	}
		// }

		// if ( !$found ) {
		// 	return response()->json(
		// 		[
		// 			'status' => 'error',
		// 			'message' => 'Get cover settings; No cover specified.'
		// 		], 400);
		// }
		
		$cover_urls = [];
		if ($found) {
			$destinationPath = 'images/'.$user['id'];
			$imagename = $source_image['name'];
			$extension = $source_image['extension'];
			$cover_urls['full'] = url('api/public/'.$destinationPath."/".$imagename."-cover-full.".$extension);
			$cover_urls['thumb'] = url('api/public/'.$destinationPath."/".$imagename."-cover-thumb.".$extension);
		}

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get cover settings.',
				'data' =>
					[
						'cover_settings' => $cover_settings,
						'cover_urls' => (object)$cover_urls
					],
				// 'token' => $new_token
			], 200);

	}

	public function get_image_archive(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ( empty($uploaded_images) ) {
			return response()->json(
					[
						'status' => 'error',
						'message' => 'Get image archive; No images present.'
					], 404);
		}

		$cover_settings = json_decode($user['cover_settings'], true);
		if (empty($cover_settings)) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Get image archive; No cover specified.'
				], 400);
		}

		$cover_image = null;
		$found = false;
		foreach($uploaded_images as $image){
			if ( $image['id'] == $cover_settings['image_id'] ) {
				$found = true;
				$cover_image = $image;
			}
		}

		if ( !$found ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Get image archive; No cover specified.'
				], 400);
		}

		// delete old cover file
		$destinationPath = 'images/'.$user['id'];
		$log_files = File::glob($destinationPath.'/*cover-full*');
		if ($log_files !== false) {
		    foreach ($log_files as $file) {
		    	File::delete($file);
		    }
		}

		$coverUrl = APIController::processCover($cover_settings, $uploaded_images, $user);

		if ( !$coverUrl ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Get image archive; There was an error processing the cover.'
				], 500);
		}

		$log_files = File::glob($destinationPath.'/archive*');
		if ($log_files !== false) {
		    foreach ($log_files as $file) {
		    	File::delete($file);
		    }
		}

		$zip_name = 'archive_'.date('ymdHis').'.zip';
		$zip = new ZipArchive;
		// exclude cover original
		$imagename = $cover_image['name'].'-full.'.$cover_image['extension'];

		if ( $zip->open(public_path().'/'.$destinationPath.'/'.$zip_name, ZipArchive::CREATE) === true ) {
			foreach ( File::glob($destinationPath.'/*-full*') as $fileName ) {
				if ( basename( $fileName ) != $imagename ) {
					$file = basename( $fileName );
					$zip->addFile( $fileName, $file );
				}
			}
			$zip->close();
		}

		$user->latest_loginstat->increment('downloads');

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get image archive.',
				'data' =>
					[
						'archive' => url('api/public/'.$destinationPath."/".$zip_name)
					],
				// 'token' => $new_token
			], 200);

	}
	
	public function get_session_data(Request $request) {
		$user_data = app('App\Http\Controllers\UserController')
			->get_user_details($request)->getData()->data;
		$image_data = $this->get_images($request)->getData()->data;
		$cover_data = $this->get_cover_settings($request)->getData()->data;
		$data = array_merge( (array)$user_data, (array)$image_data, (array)$cover_data );
		
		return response()->json([
				'status' => 'success',
				'message' => 'Get session data.',
				'data' => $data
			], 200);
	}

}
