<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

	<title>Grunt</title>

	<link rel="stylesheet" href="assets/front/css/style.css">
</head>

<body id="top">

	<?php $f = 'assets/front/svg/shapes.svg'; if (file_exists($f)) { include($f); } ?>

	<div id="#container">

		<h1>Hello world!</h1>

	</div>

	<script src="//code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="assets/front/js/scripts.js"></script>

	<?php /*
	Delete livereload.js on production or wrap it in if statement 
	
	@if (App::environment('local'))

	@endif
	*/ ?>
	<script src="http://localhost:35755/livereload.js"></script>

</body>
</html>