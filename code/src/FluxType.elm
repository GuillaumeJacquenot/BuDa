module FluxType exposing (Model, Msg(..), defaultModel, setValue, getValue, toList)

import Dict exposing (Dict)


-- import Html exposing (Html, button, div, input, label, text)
-- import Html.Attributes exposing (id, style, type_, checked, class)
-- import Html.Events exposing (onClick)
-- import Material.Dialog as Dialog
-- import Material.Button as Button
-- import Actions exposing(Msg, UpdateFlux)


type alias Model =
    { parameters : Dict String Bool
    , visible : Bool
    }


type Msg
    = NoOp
    | UpdateFlux String Bool
    | HideShowDialog


defaultModel : Model
defaultModel =
    { parameters =
        Dict.fromList
            [ ( "Air", False )
            , ( "Fresh Water", False )
            , ( "Salt Water", False )
            , ( "400 V AC", False )
            , ( "230 V AC", False )
            , ( "48 V DC", False )
            , ( "Command & Control", False )
            , ( "Digital", False )
            , ( "DO/HFO", False )
            , ( "Others", False )
            ]
    , visible = False
    }


setValue : String -> Bool -> Model -> Model
setValue s b model =
    let
        new_parameters =
            Dict.update s (always (Just b)) model.parameters
    in
        { model | parameters = new_parameters }


getValue : String -> Model -> Maybe Bool
getValue s model =
    Dict.get s model.parameters


toList : Model -> List ( String, Bool )
toList model =
    Dict.toList model.parameters
