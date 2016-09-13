<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'brands', 'theme_color'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token', 'created_at', 'updated_at'//, 'last_uploaded_images'
    ];

    /**
     * Get the login stats for the user.
     */
    public function loginstats() {
        return $this->hasMany('App\LoginStat');
    }

    public function latest_loginstat() {
        return $this->hasOne('App\LoginStat')->latest();
    }
}
