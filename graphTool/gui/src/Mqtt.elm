port module Mqtt exposing (ConnectionType(..), Model, init, url, clientId, setUrl, setClientId, setTopic, setConsumer, send, subscriptions, connectionType2String)

import Json.Decode


type ConnectionType
    = Producer
    | Consumer


type alias MqttToJSEvent =
    { tag : String
    , data : Json.Decode.Value
    }


type alias MqttFromJSEvent =
    { tag : String
    , data : Json.Decode.Value
    }


type alias Model =
    { url : String
    , clientId : String
    , topic : String
    , connectionType : ConnectionType
    }


init : Model
init =
    { url = "mqtt://130.66.124.234:15675/ws"
    , clientId = "unknown"
    , topic = "architecture"
    , consumer = False
    }


url : String
url =
    init.url


clientId : String
clientId =
    init.clientId


setUrl : String -> Model -> Model
setUrl s model =
    { model | url = s }


setClientId : String -> Model -> Model
setClientId s model =
    { model | clientId = s }


setTopic : String -> Model -> Model
setTopic s model =
    { model | topic = s }


setConsumer : Bool -> Model -> Model
setConsumer b model =
    { model | consumer = b }


port send : MqttToJSEvent -> Cmd msg


port receive : (MqttFromJSEvent -> msg) -> Sub msg
