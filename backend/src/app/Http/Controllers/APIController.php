<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests;

use JWTAuth, File, Validator, Imagick, ImagickPixel, ImagickDraw, ZipArchive;


class APIController extends Controller {

	public function add_images(Request $request) {

		$bigSize = env('IMAGE_SIZE_LARGE', 1000);
		$smallSize = env('IMAGE_SIZE_SMALL', 300);

		$user = JWTAuth::toUser($request->input('token'));
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
		//$last_uploaded_images = $user->last_uploaded_images;
		$uploaded_images = json_decode($user->last_uploaded_images, true);
		$new_images = [];
		
		if ($request->hasFile('images')) {
			$files = $request->file('images');
			foreach($files as $file){
				$originalname = $file->getClientOriginalName();
				$filename = pathinfo($originalname, PATHINFO_FILENAME);
				$extension = pathinfo($originalname, PATHINFO_EXTENSION);

				$user->latest_loginstat->increment('uploads');

				$upload_id_string = sprintf('%03d', $user->latest_loginstat['uploads']);

				$imagename = $upload_id_string."_".$filename;

				$upload_success = $file->move($tempPath, $imagename.".".$extension);

				if ($upload_success) {

					$image_id = $user->latest_loginstat['uploads'];

					$imagick = new Imagick(public_path()."/".$tempPath."/".$imagename.".".$extension);

				    $imagick->normalizeImage(); // normalize image
				    $imagick->AutoGammaImage(); // auto gamma
					$imagick->autoLevelImage(); // adjust color channels
					$imagick->enhanceImage(); // remove noise
					//$imagick->contrastImage(0.5); // raise contrast / to strong??

					if ( $imagick->getImageWidth() > $bigSize || $imagick->getImageHeight() > $bigSize ) {
						$imagick->resizeImage($bigSize, $bigSize, imagick::FILTER_LANCZOS, 1, true);
					}
					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-full.".$extension);

					$imagick->resizeImage($smallSize, $smallSize, imagick::FILTER_LANCZOS, 1, true);
					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-thumb.".$extension);

					$imagick->clear();
					$imagick->destroy();
					
					
					$new_image = array(
							'id' => $image_id,
							'name' => $imagename,
							'extension' => $extension,
							'urls' => array(
									'full' => $destinationPath."/".$imagename."-full.".$extension,
									'thumb' => $destinationPath."/".$imagename."-thumb.".$extension
								)
						);
					
					$uploaded_images[] = $new_image;
					$new_images[] = $new_image;

					File::cleanDirectory($tempPath);

				} else {
					$user->latest_loginstat->decrement('uploads');
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

		$uploaded_images_json = json_encode($uploaded_images); //JSON_FORCE_OBJECT
		$user->last_uploaded_images = $uploaded_images_json;
		$user->save();

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
			}
		}

		if ( !$found ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Remove image; image_id not found.'
				], 404);
		}

		$uploaded_images_json = json_encode($uploaded_images); //JSON_FORCE_OBJECT
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

		$cover_settings = $request->except(['token']);

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
		
		$defaults = [
			'border' => [
				'color1' => '#ffffff'
			],
			'logos' => [
				'position' => 4,
				'brand' => ''
			],
			'eyecatcher' => [
				'position' => 2,
				'form' => '',
				'color' => '#ffffff',
				'text' => ''
			]
		];
		
		$cover_settings = array_replace_recursive($defaults, $cover_settings);
		
		// $validator = Validator::make($cover_settings, array(
		// 		'border.color1' => 'required',
		// 			'logos.position' => 'required',
		// 			'logos.brand' => 'required',
		// 			'eyecatcher.position' => 'required',
		// 			'eyecatcher.form' => 'required',
		// 			'eyecatcher.color' => 'required',
		// 			'eyecatcher.text' => 'required',
		// 	));
		// if ($validator->fails()) {
		// 	return response()->json(
		//         	[
		// 			'status' => 'error',
		// 			'message' => 'Set cover failed; Parameters are misssing.'
		// 		], 400);
		// }

		// delete old cover file
		$destinationPath = 'images/'.$user['id'];
		$log_files = File::glob($destinationPath.'/*cover*');
		if ($log_files !== false) {
		    foreach ($log_files as $file) {
		    	File::delete($file);
		    }
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

		$border_color1 = $cover_settings['border']['color1'];
		$border_color2 = $border_orientation = "";
		if (!empty($cover_settings['border']['color2'])) {
			$border_color2 = $cover_settings['border']['color2'];
		}
		if (!empty($cover_settings['border']['orientation'])) {
			$border_orientation = $cover_settings['border']['orientation'];
		}

		$logos_position = $cover_settings['logos']['position'];
		$logos_brand = $cover_settings['logos']['brand'];

		$eyecatcher_position = $cover_settings['eyecatcher']['position'];
		$eyecatcher_form = $cover_settings['eyecatcher']['form'];
		$eyecatcher_color = $cover_settings['eyecatcher']['color'];
		$eyecatcher_text = $cover_settings['eyecatcher']['text'];

		$imagick = new Imagick(public_path()."/".$destinationPath."/".$imagename."-full.".$extension);

		$image_width = $imagick->getImageWidth();
		$image_height = $imagick->getImageHeight();

		$unit_percentage = 2; // percentage of width
		$unit = ( $image_width / 100 ) * $unit_percentage;
		$border_width = $unit*2;
		$logo_height = $unit*4;
		// $eyecatcher_size = $unit*10;
		$eyecatcher_size = 250;

		// Set border
		if ($border_color2 == "") {
			$color = new ImagickPixel($border_color1);
			$imagick->borderImage($color, $border_width, $border_width);
		} else {
			$gradient = new Imagick();
			if ($border_orientation == "horizontal") {
				$gradient->newPseudoImage($image_width+$border_width*2, $image_height+$border_width*2, "gradient:".$border_color1."-".$border_color2);
			} else {
				$gradient->newPseudoImage($image_height+$border_width*2, $image_width+$border_width*2, "gradient:".$border_color1."-".$border_color2);
				$gradient->rotateImage("#ffffff", 90);
			}
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
		$userlogo->resizeImage(9999, $logo_height, imagick::FILTER_LANCZOS, 1, true);
		
		if (!$brand_missing) {
			$brandlogo = new Imagick(public_path()."/brand-logos/".str_slug($logos_brand, '_').".png");
			$brandlogo->resizeImage(9999, $logo_height, imagick::FILTER_LANCZOS, 1, true);
		}
			
		$logo_compound_width = $userlogo->getImageWidth() + $unit;
		if (!$brand_missing) { $logo_compound_width += $brandlogo->getImageWidth(); }
		$logo_compound = new Imagick();
		$logo_compound->newImage($logo_compound_width, $logo_height, 'none');

		$logo_compound->compositeImage( $userlogo, imagick::COMPOSITE_OVER, 0, 0);
		if (!$brand_missing) {
			$logo_compound->compositeImage( $brandlogo, imagick::COMPOSITE_OVER, $userlogo->getImageWidth() + $unit, 0);
		}
		
		$userlogo->clear();
		$userlogo->destroy();
		if (!$brand_missing) {
			$brandlogo->clear();
			$brandlogo->destroy();
		}

		$offset = $border_width + $unit;

		$offset_x = ($logos_position == 2 || $logos_position == 3 ) ? $image_width - $offset - $logo_compound_width : $offset;
		$offset_y = ($logos_position == 4 || $logos_position == 3 ) ? $image_height - $offset - $logo_height : $offset;

		$imagick->compositeImage( $logo_compound, imagick::COMPOSITE_OVER, $offset_x, $offset_y);

		if ( !empty($eyecatcher_text) ) {
			// Place eye catcher
			$eyecatcher = new ImagickDraw();
			$color = new ImagickPixel($eyecatcher_color);
			$eyecatcher->setStrokeOpacity(1);
			$eyecatcher->setStrokeColor($color);
			$eyecatcher->setFillColor($color);

			$offset = $border_width + $unit;

			$offset_x = ($eyecatcher_position == 2 || $eyecatcher_position == 3 ) ? $image_width - ($offset+$eyecatcher_size) : $offset+$eyecatcher_size;
			$offset_y = ($eyecatcher_position == 4 || $eyecatcher_position == 3 ) ? $image_height - $offset : $offset;
			$eyecatcher->translate($offset_x, $offset_y);
			
			if ($eyecatcher_form == "circle") {
				$eyecatcher->circle($eyecatcher_size / 2, $eyecatcher_size / 2, $eyecatcher_size, $eyecatcher_size / 2);
			} else if ($eyecatcher_form == "rectangle") {
				$eyecatcher->rectangle(0, 0, $eyecatcher_size, $eyecatcher_size);
			} else {
				APIController::drawBadge($eyecatcher, $eyecatcher_size);
			}

			$imagick->drawImage($eyecatcher);

			// Add text
			$text = new ImagickDraw();
			$text->setFont('fonts/Anton.ttf');
			$text->setFontSize(100);
			$text->setFillColor('black');

			$text_img = new Imagick();
			$text_img->newImage(500, 200, 'none');
			$text_img->annotateImage($text, 0, 100, 0, $eyecatcher_text);
			$text_img->trimImage(0.1);
			$text_img->resizeImage($eyecatcher_size-$unit*2, $eyecatcher_size-$unit*2, imagick::FILTER_LANCZOS, 1, true);
			$text_img->borderImage('none', $unit, $unit);
			$text_height = $text_img->getImageHeight();

			$imagick->compositeImage( $text_img, imagick::COMPOSITE_OVER, $offset_x, $offset_y - $text_height / 2 + $eyecatcher_size/2);
		}

		// Write file
		$url_full = $destinationPath."/".$imagename."-cover-full.".$extension;
		$url_thumb = $destinationPath."/".$imagename."-cover-small.".$extension;
		$imagick->writeImage(public_path()."/".$url_full);
		$smallsize = env('IMAGE_SIZE_SMALL', 300);
		$imagick->resizeImage($smallsize, $smallsize, imagick::FILTER_LANCZOS, 1, true);
		$imagick->writeImage(public_path()."/".$url_thumb);
		$imagick->clear();
		$imagick->destroy();

		return ['thumb' => $url_thumb, 'full' => $url_full];
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
		
		$cover_thumb = '';
		if ($found) {
			$destinationPath = 'images/'.$user['id'];
			$imagename = $source_image['name'];
			$extension = $source_image['extension'];
			$cover_thumb = $destinationPath."/".$imagename."-cover-thumb.".$extension;
		}

		// $new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get cover settings.',
				'data' =>
					[
						'cover_settings' => $cover_settings,
						'cover_thumb' => $cover_thumb
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

		$coverUrl = APIController::processCover($cover_settings, $uploaded_images, $user, false);

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
						'archive' => $destinationPath."/".$zip_name
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
