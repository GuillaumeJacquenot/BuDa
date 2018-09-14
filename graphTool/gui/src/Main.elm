module Main exposing (..)

import Html exposing (Html)
import View
import Actions
import Messages exposing (Msg(..))
import Model exposing (Model, defaultModel)
import LinkToJS
import Keyboard


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = View.view
        , update = Actions.update
        , subscriptions = subscriptions
        }


init : ( Model, Cmd Msg )
init =
    ( defaultModel, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    -- Sub.none
    Sub.batch
        [ LinkToJS.selection Selection
        , LinkToJS.modeltoelm ModelToElm
        , LinkToJS.csvmodeltoelm CsvModelToElm
        , LinkToJS.csv2modeltoelm Csv2ModelToElm
        , LinkToJS.importModeltoelm ImportModelToElm
        , LinkToJS.importCsvModeltoelm ImportCsvModeltoElm
        , LinkToJS.doubleclick DoubleClick
        , LinkToJS.nodesPositionToElm NodesPositionToElm
        , LinkToJS.nodesPositionRequest NodesPositionRequest
        , LinkToJS.sendGeometryToElm SendGeometryToElm
        , Keyboard.ups KeyUps
        , Keyboard.downs KeyDowns
        ]
