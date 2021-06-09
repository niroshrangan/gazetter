<?php

    $fileContents = file_get_contents("../data/countryBorders.geo.json");
    $output = json_decode($fileContents);
    $features = $output->features;

    $countryData = [];
    $arrayElement = [];

    foreach ($features as $element) {
        $countryName = $element->properties->name;
        $countryCode = $element->properties->iso_a2;

        $arrayElement = [$countryName, $countryCode];
        array_push($countryData, $arrayElement);
    }

    usort($countryData, function($country, $nextCountry) {
        return strcmp($country[0], $nextCountry[0]);
    });

    echo json_encode($countryData);

?>
