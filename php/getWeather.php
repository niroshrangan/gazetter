<?php 

    $url = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=" . $_REQUEST['lat'] . "&lon=" . $_REQUEST['lng'] . "&exclude=current,minutely,hourly,alerts&APPID=7de4db63ae9efae2745a2979476749db";

    $string = file_get_contents($url);

    $json = json_decode($string);
    
    
    $end = json_encode($json);

    print_r($end);

?>


