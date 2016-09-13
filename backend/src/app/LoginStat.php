<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class LoginStat extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'token', 'uploads', 'downloads'
    ];

}
