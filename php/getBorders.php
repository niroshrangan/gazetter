<?php

    $fileContents = file_get_contents("../data/countryBorders.geo.json");
    $output = json_decode($fileContents);
    $features = $output->features;

    $borderCoords = [];

    foreach($features as $element) {
        if ($_REQUEST['country_code'] == $element->properties->iso_a2) {
            $borderCoords = $element->geometry;
        }
    }
    echo json_encode($borderCoords);

?>
