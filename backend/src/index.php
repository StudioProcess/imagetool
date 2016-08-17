<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

  <pre><?php
  $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator('.'));
  foreach ($rii as $file) {
    if ($file->isDir()){
      continue;
    }
    echo $file->getPathname() . PHP_EOL;
  }
  ?></pre>

</body>
</html>
