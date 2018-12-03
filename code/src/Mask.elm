module Mask exposing (Model, defaultModel, member, insert, remove)

import Identifier exposing (Identifier)
import Set exposing (Set)


type alias Model =
    Set Identifier


defaultModel : Model
defaultModel =
    Set.empty


member : Identifier -> Model -> Bool
member =
    Set.member


remove : Identifier -> Model -> Model
remove =
    Set.remove


insert : Identifier -> Model -> Model
insert =
    Set.insert
