module Simple exposing (subscriptions, init)

import Messages exposing (Msg(..))


-- import Actions

import Model exposing (Model, defaultModel)
import LinkToJS
import Keyboard


subscriptions : Model -> Sub Msg
subscriptions model =
    -- Sub.none
    Sub.batch
        [ -- WebSocket.listen (model.modelURL) (NewSimuState << Json.Decode.decodeString Decoders.timerResponseDecode)
          LinkToJS.selection Selection
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
          -- , subLayout model
        ]


init : ( Model, Cmd Msg )
init =
    ( defaultModel, Cmd.none )
