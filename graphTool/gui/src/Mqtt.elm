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


init : String -> Model
init url =
    { url = url
    , clientId = "unknown"
    , topic = "architecture"
    , connectionType = Producer
    }


url : Model -> String
url model =
    model.url


clientId : Model -> String
clientId model =
    model.clientId


setUrl : String -> Model -> Model
setUrl s model =
    { model | url = s }


setClientId : String -> Model -> Model
setClientId s model =
    { model | clientId = s }


setTopic : String -> Model -> Model
setTopic s model =
    { model | topic = s }


setConsumer : ConnectionType -> Model -> Model
setConsumer c model =
    { model | connectionType = c }


port send : MqttToJSEvent -> Cmd msg


port receive : (MqttFromJSEvent -> msg) -> Sub msg
