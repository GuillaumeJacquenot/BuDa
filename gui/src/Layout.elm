module Layout exposing (Layout, NodeLayout, GeometryLayout)

import Identifier exposing (Identifier)
import Position exposing (NodePosition)


type alias Layout =
    List NodePosition


type alias NodeLayout =
    { id : Identifier
    , layout : Layout
    }


type alias GeometryLayout =
    { id : Identifier
    , layout : Layout
    }
