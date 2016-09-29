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
        // $this->call(UsersTableSeeder::class);
        DB::table('users')->insert([
            'name' => "Admin",
            'email' => 'crux23@gmail.com',
            'password' => bcrypt('12345678'),
            'theme_color' => "default",
            'is_admin' => true
        ]);
    }
}
