<?php
    // $country_code = $_GET['country_code'];
    // $data = file_get_contents("https://restcountries.eu/rest/v2/alpha/$country_code");
    // print_r($data);

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url = "https://restcountries.eu/rest/v2/alpha/" . $_REQUEST['country_code'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);
   

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    // $output['data'] = $decode['result'];
    
    echo json_encode($decode);
?>