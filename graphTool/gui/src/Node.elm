module Node exposing (Node, node, inGroup)

import Identifier exposing (Identifier)
import Attribut exposing (Attribut)
import Set exposing (Set)


type alias Node =
    { id : Identifier
    , name : String
    , parent : Maybe Identifier
    , attribut : Maybe Attribut
    , group : Set Identifier
    }


node : Identifier -> String -> Maybe Identifier -> Node
node i s p =
    { id = i
    , name = s
    , parent = p
    , attribut = Nothing
    , group = Set.empty
    }


inGroup : Identifier -> Node -> Bool
inGroup s n =
    Set.member s n.group
