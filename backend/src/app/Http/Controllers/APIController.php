<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests;

use JWTAuth, File, Validator, Imagick, ImagickPixel, ImagickDraw, ZipArchive;


class APIController extends Controller {

	public function add_images(Request $request) {

		$bigSize = 2000;
		$smallSize = 300;

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

					$uploaded_images[] = array(
							'id' => $image_id,
							'name' => $imagename,
							'extension' => $extension,
							'urls' => array(
									'full' => $destinationPath."/".$imagename."-full.".$extension,
									'thumb' => $destinationPath."/".$imagename."-thumb.".$extension
								)
						);

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
			$new_token = JWTAuth::refresh($request->input('token'));
			return response()->json(
				[
					'status' => 'success',
					'message' => 'Add images; Image(s) uploaded.',
					'data' =>
						[
							'last_uploaded_images' => $uploaded_images_json
						],
					'token' => $new_token
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

		$new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Remove image; Images removed.',
				'data' =>
					[
						'last_uploaded_images' => $uploaded_images_json
					],
				'token' => $new_token
			], 200);

	}

	public function get_images(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ( empty($uploaded_images) ) {
			return response()->json(
					[
						'status' => 'error',
						'message' => 'Get images; No images present.'
					], 404);
		}

		$new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get images; List of images.',
				'data' =>
					[
						'last_uploaded_images' => $user['last_uploaded_images']
					],
				'token' => $new_token
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

		$validator = Validator::make($cover_settings, array(
				'border.color1' => 'required',
    			'logos.position' => 'required',
    			'logos.brand' => 'required',
    			'eyecatcher.position' => 'required',
    			'eyecatcher.form' => 'required',
    			'eyecatcher.color' => 'required',
    			'eyecatcher.position' => 'required',
			));
		if ($validator->fails()) {
			return response()->json(
            	[
					'status' => 'error',
					'message' => 'Set cover failed; Parameters are misssing.'
				], 400);
		}

		// delete old cover file
		$destinationPath = 'images/'.$user['id'];
		$log_files = File::glob($destinationPath.'/*cover*');
		if ($log_files !== false) {
		    foreach ($log_files as $file) {
		    	File::delete($file);
		    }
		}

		$coverUrl = APIController::processCover($cover_settings, $uploaded_images, $user, true);

		if ( !$coverUrl ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Set cover; There was an error processing the cover.'
				], 500);
		}

		// save cover settings
		$user->cover_settings = json_encode($cover_settings);
		$user->save();

		$new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Set cover; Cover generated.',
				'data' =>
					[
						'cover_settings' => $user->cover_settings,
						'cover_thumb' => $coverUrl
					],
				'token' => $new_token
			], 200);

	}

	public static function processCover($cover_settings, $uploaded_images, $user, $preview){

		$image_version = ($preview) ? 'thumb' : 'full';

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

		$imagick = new Imagick(public_path()."/".$destinationPath."/".$imagename."-".$image_version.".".$extension);

		$image_width = $imagick->getImageWidth();
		$image_height = $imagick->getImageHeight();

		$unit_percentage = 2; // percentage of width
		$unit = ( $image_width / 100 ) * 2;
		$border_width = $unit*2;
		$logo_height = $unit*4;
		$eyecatcher_size = $unit*10;

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
		$userlogo = new Imagick(public_path()."/userlogos/".str_slug($user->name).".png");
		$userlogo->resizeImage(9999, $logo_height, imagick::FILTER_LANCZOS, 1, true);

		$brandlogo = new Imagick(public_path()."/carbrands/".str_slug($logos_brand).".png");
		$brandlogo->resizeImage(9999, $logo_height, imagick::FILTER_LANCZOS, 1, true);

		$logo_compound_width = $userlogo->getImageWidth() + $brandlogo->getImageWidth() + $unit;
		$logo_compound = new Imagick();
		$logo_compound->newImage($logo_compound_width, $logo_height, 'none');

		$logo_compound->compositeImage( $userlogo, imagick::COMPOSITE_OVER, 0, 0);
		$logo_compound->compositeImage( $brandlogo, imagick::COMPOSITE_OVER, $userlogo->getImageWidth() + $unit, 0);

		$userlogo->clear();
		$userlogo->destroy();
		$brandlogo->clear();
		$brandlogo->destroy();

		$offset = $border_width + $unit;

		$offset_x = ($logos_position == 2 || $logos_position == 3 ) ? $image_width - $offset - $logo_compound_width : $offset;
		$offset_y = ($logos_position == 4 || $logos_position == 3 ) ? $image_height - $offset - $logo_height : $offset;

		$imagick->compositeImage( $logo_compound, imagick::COMPOSITE_OVER, $offset_x, $offset_y);

		// Place eye catcher
		$eyecatcher = new ImagickDraw();
		$color = new ImagickPixel($eyecatcher_color);
		$eyecatcher->setStrokeOpacity(1);
    	$eyecatcher->setStrokeColor($color);
   		$eyecatcher->setFillColor($color);

   		$offset = $border_width + $unit + $eyecatcher_size / 2;

		$offset_x = ($eyecatcher_position == 2 || $eyecatcher_position == 3 ) ? $image_width - $offset : $offset;
		$offset_y = ($eyecatcher_position == 4 || $eyecatcher_position == 3 ) ? $image_height - $offset : $offset;

		if ($eyecatcher_form == "circle") {
			$eyecatcher->circle($offset_x, $offset_y, $offset_x + $eyecatcher_size / 2, $offset_y);
		} else {
			$eyecatcher->rectangle($offset_x - $eyecatcher_size / 2, $offset_y - $eyecatcher_size / 2, $offset_x + $eyecatcher_size / 2, $offset_y + $eyecatcher_size / 2);
		}

		$imagick->drawImage($eyecatcher);

		// Add text
		$text = new ImagickDraw();
		$text->setFont('fonts/Asap-Regular.ttf');
		$text->setFontSize(30);
		$text->setFillColor('black');

		$text_img = new Imagick();
		$text_img->newImage(500, 200, 'none');
		$text_img->annotateImage($text, 0, 30, 0, $eyecatcher_text);
		$text_img->trimImage(0.1);
		$text_img->resizeImage($eyecatcher_size-$unit*2, $eyecatcher_size-$unit*2, imagick::FILTER_LANCZOS, 1, true);
		$text_img->borderImage('none', $unit, $unit);
		$text_height = $text_img->getImageHeight();

		$imagick->compositeImage( $text_img, imagick::COMPOSITE_OVER, $offset_x - $eyecatcher_size / 2, $offset_y - $text_height / 2);

		// Write file
		$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-cover-".$image_version.".".$extension);

		$imagick->clear();
		$imagick->destroy();

		return $destinationPath."/".$imagename."-cover-".$image_version.".".$extension;
	}

	public function get_cover_settings(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ( empty($uploaded_images) ) {
			return response()->json(
					[
						'status' => 'error',
						'message' => 'Get cover settings; No images present.'
					], 404);
		}

		$cover_settings = json_decode($user['cover_settings'], true);
		if (empty($cover_settings)) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Get cover settings; No cover specified.'
				], 400);
		}

		$source_image = null;
		$found = false;
		foreach($uploaded_images as $image){
			if ( $image['id'] == $cover_settings['image_id'] ) {
				$found = true;
				$source_image = $image;
			}
		}

		$found = false;
		foreach($uploaded_images as $image){
			if ( $image['id'] == $cover_settings['image_id'] ) {
				$found = true;
			}
		}

		if ( !$found ) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Get image archive; No cover specified.'
				], 400);
		}

		$destinationPath = 'images/'.$user['id'];
		$imagename = $source_image['name'];
		$extension = $source_image['extension'];

		$new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get cover settings.',
				'data' =>
					[
						'cover_settings' => $cover_settings,
						'cover_thumb' => $destinationPath."/".$imagename."-cover-thumb.".$extension
					],
				'token' => $new_token
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

		$new_token = JWTAuth::refresh($request->input('token'));
		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get image archive.',
				'data' =>
					[
						'archive' => $destinationPath."/".$zip_name
					],
				'token' => $new_token
			], 200);

	}

}
