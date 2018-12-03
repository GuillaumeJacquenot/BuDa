module Position exposing (Position, NodePosition, defaultPosition)

import Identifier exposing (Identifier)


type alias Position =
    { x : Float
    , y : Float
    }


type alias NodePosition =
    { id : Identifier
    , position : Position
    }


defaultPosition : Position
defaultPosition =
    { x = 0, y = 0 }
