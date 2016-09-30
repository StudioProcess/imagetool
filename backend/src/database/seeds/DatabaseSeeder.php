<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'name' => "Admin",
            'email' => 'admin@admin.admin',
            'password' => bcrypt(env('ADMIN_PWD')),
            'theme_color' => "default",
            'is_admin' => true
        ]);
    }
}
