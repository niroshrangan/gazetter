<?php 

$url = "http://api.geonames.org/citiesJSON?north=" . $_REQUEST['northCoords'] . "&south=" . $_REQUEST['southCoords'] . "&east=" . $_REQUEST['eastCoords'] . "&west=" . $_REQUEST['westCoords'] . "&lang=en&username=n1509";

$string = file_get_contents($url);

$json = json_decode($string);

$end = json_encode($json);

print_r($end);

?>