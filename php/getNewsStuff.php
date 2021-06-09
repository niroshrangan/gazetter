<?php
    // ini_set('display_errors', 'On');
    // error_reporting(E_ALL);

    //$executionStartTime = microtime(true);

    $url = "http://newsapi.org/v2/everything?q=" . urlencode($_REQUEST['countryName']) . "&sortBy=publishedAt&pageSize=4&apiKey=9a8108e7e09f4ba7a7ed07c460674cd4";

    //$url = "http://newsapi.org/v2/everything?q=united%20kingdom&sortBy=publishedAt&pageSize=4&apiKey=9a8108e7e09f4ba7a7ed07c460674cd4";

    // $ch = curl_init();
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($ch, CURLOPT_URL,$url);

    // $result=curl_exec($ch);

    // curl_close($ch);

    // $decode = json_decode($result,true);

    // $output['status']['code'] = "200";
    // $output['status']['name'] = "ok";
    // $output['status']['description'] = "success";
    // $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    // $output['data'] = $decode['articles'];

    $string = file_get_contents($url);

    $json = json_decode($string);
    $articles = $json->articles;

    $newsData = [];
    $arrayElement = [];

    foreach($articles as $element) {
        $title = $element->title;
        $link = $element->url;
        $linkImg = $element->urlToImage;

        $arrayElement = [$title, $link, $linkImg];
        array_push($newsData, $arrayElement);
    }
    echo json_encode($newsData);
?>  
