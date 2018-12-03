module Tightness exposing (Model, default, updateTightness, removeTightness, isTightness)

import Identifier exposing (Identifier)
import Set exposing (Set)


type alias Model =
    Set Identifier


default : Model
default =
    Set.empty


isTightness : Identifier -> Model -> Bool
isTightness =
    Set.member


addTightness : Identifier -> Model -> Model
addTightness =
    Set.insert


removeTightness : Identifier -> Model -> Model
removeTightness =
    Set.remove


updateTightness : Identifier -> Model -> Model
updateTightness id model =
    case isTightness id model of
        True ->
            removeTightness id model

        False ->
            addTightness id model
