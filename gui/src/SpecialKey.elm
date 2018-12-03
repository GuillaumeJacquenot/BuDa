module SpecialKey exposing (Model, defaultModel, member, insert, remove, shift)

import Set exposing (Set)
import Keyboard exposing (KeyCode)


type alias Model =
    Set KeyCode


shift : KeyCode
shift =
    16


defaultModel : Model
defaultModel =
    Set.empty


member : KeyCode -> Model -> Bool
member =
    Set.member


remove : KeyCode -> Model -> Model
remove =
    Set.remove


insert : KeyCode -> Model -> Model
insert =
    Set.insert
