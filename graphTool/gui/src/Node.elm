module Node exposing (Node, node, inGroup, hasGeometry, removeGeometry, blow, initRoles)

import Identifier exposing (Identifier)
import Position exposing (Position)
import Attribut exposing (Attribut)
import ElementAttributes exposing (..)
import Set exposing (Set)
import LinkParameters

type alias Node =
    { id : Identifier
    , name : String
    , parent : Maybe Identifier
    , attribut : Maybe Attribut
    , state : ElementState
    , roles : Roles
    , geometry : Maybe Identifier
    , group : Set Identifier
    , highLighted : Int
    , position : Position
    , blow : Bool
    }


node : Identifier -> String -> Maybe Identifier -> Node
node id name parent =
    { id = id
    , name = name
    , parent = parent
    , attribut = Nothing
    , state = RAS
    , roles = []
    , geometry = Nothing
    , group = Set.empty
    , highLighted = 0
    , position = Position.defaultPosition
    , blow = False
    }


inGroup : Identifier -> Node -> Bool
inGroup s n =
    Set.member s n.group


hasGeometry : Identifier -> Node -> Bool
hasGeometry s n =
    case n.geometry of
        Nothing ->
            False

        Just i ->
            (i == s)


removeGeometry : Identifier -> Node -> Node
removeGeometry s n =
    { n | geometry = Nothing }


blow : Node -> Node
blow n =
    { n | blow = not n.blow }

initRoles : Node -> LinkParameters.Model -> Node
initRoles node parameters =
    let 
        parameterIds = List.map .id parameters
        roles = List.map (\parameterId -> { network = parameterId, role = RoleUnknown }) parameterIds
    in 
        { node | roles = roles }
