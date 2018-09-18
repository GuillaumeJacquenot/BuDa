module DataModel
    exposing
        ( DataEdge
        , DataModel
        , DataNode
        , ExportLink
          -- , Edge
          -- , Identifier
        , MetaModel
        , Model
          -- , Node
        , addNewNodeToModel
        , anyLink
        , anyLinks
        , anyLinksParameter
        , bros
        , childs
        , createProperty
        , createGroupProperty
        , createGeometry
        , dataModelToModel
        , defaultModel
        , deleteProperty
        , deleteGroupProperty
        , deleteGeometry
        , edgeST
        , getEdgeFromId
        , getEdgeFromNodesId
        , getEdgeIdFromNodesId
        , getEdgeFromNodesName
        , getNodeFromId
        , getNodeFromName
        , getNodeIdFromName
        , getNodeIdentifier
        , getNodeNameFromId
        , getNodeFromNameAndParent
        , getNodeIdFromNameAndParent
        , getNodeListFromName
        , getParentFromNodeId
        , getLayoutFromNodeId
        , getGeometryLayoutFromId
        , isEdgePresent
        , isNamePresent
        , isNodePresent
        , isNodeIdPresent
        , isIdPresentInList
        , isLayoutPresent
        , nodeHasParent
        , maximumNodeId
        , anyEdgeDoublon
        , nodeListSameParent
        , triNodes
        , getCurIdFromModel
        )

import Identifier exposing (Identifier)
import Link exposing (Edge)
import Node exposing (Node, initRoles)
import LinkParameters
import Groups
import Set exposing (Set)
import TightnessActions
import Layout exposing (Layout, NodeLayout, GeometryLayout)
import Mask
import Geometries
import ElementAttributes


type alias Model =
    { nodes : List Node
    , edges : List Edge
    , parameters : LinkParameters.Model
    , curNodeId : Identifier
    , groups : Groups.Model
    , geometries : Geometries.Model
    , lightedGroup : Maybe Identifier
    , lightedGeometry : Maybe Identifier
    , selectedParameters : Set Identifier
    , mustLayout : Bool
    , layouts : List NodeLayout
    , geometryLayouts : List GeometryLayout
    , lightLayout : Maybe Layout
    , rootBubbleLayout : Maybe Layout
    , mask : Mask.Model
    , geometryImage : Maybe String
    }


type alias MetaModel =
    { filename : String
    , model : Model
    }


type alias ExportLink =
    { filename : String
    , model : String
    }


type alias DataNode =
    { data : Node }


type alias DataEdge =
    { data : Edge }


type alias DataModel =
    { nodes : List DataNode
    , edges : List DataEdge
    , parameters : LinkParameters.Model
    , groups : Groups.Model
    , geometries : Geometries.Model
    , lightedGroup : Maybe Identifier
    , lightedGeometry : Maybe Identifier
    , selectedParameters : Set Identifier
    , layouts : List NodeLayout
    , geometryLayouts : List GeometryLayout
    , lightLayout : Maybe Layout
    , rootBubbleLayout : Maybe Layout
    , mask : Mask.Model
    , geometryImage : Maybe String
    }


defaultModel : Model
defaultModel =
    { nodes = []
    , edges = []
    , parameters = LinkParameters.defaultModel
    , curNodeId = 0
    , groups = Groups.defaultModel
    , geometries = Geometries.defaultModel
    , lightedGroup = Nothing
    , lightedGeometry = Nothing
    , selectedParameters = Set.empty
    , mustLayout = False
    , layouts = []
    , geometryLayouts = []
    , lightLayout = Nothing
    , rootBubbleLayout = Nothing
    , mask = Mask.defaultModel
    , geometryImage = Nothing
    }


dataNodeToNode : DataNode -> Node
dataNodeToNode dn =
    dn.data


dataEdgeToEdge : DataEdge -> Edge
dataEdgeToEdge de =
    de.data


maximumNodeId : List Node -> Identifier
maximumNodeId ln =
    case List.maximum (List.map (\x -> x.id) ln) of
        Nothing ->
            0

        Just m ->
            m


maximumEdgeId : List Edge -> Identifier
maximumEdgeId le =
    case List.maximum (List.map (\x -> x.id) le) of
        Nothing ->
            0

        Just m ->
            m


maximumParameterId : List LinkParameters.Property -> Identifier
maximumParameterId list =
    case List.maximum (List.map (\x -> x.id) list) of
        Nothing ->
            0

        Just m ->
            m


updateRoles : LinkParameters.Model -> Node -> Node
updateRoles parameters node =
    let
        currentNetworks =
            List.map .network node.roles

        parameterIds =
            List.map .id parameters

        -- Compare parameters and roles to define which one should be added/removed
        roleIdsToAdd =
            List.filter (\parameterId -> not (List.member parameterId currentNetworks)) parameterIds

        roleIdsToRemove =
            List.filter (\network -> not (List.member network parameterIds)) currentNetworks

        -- Remove outdated roles
        rolesWithoutRemoved =
            List.filter (\role -> not (List.member role.network roleIdsToRemove)) node.roles

        -- Add the missing roles
        rolesToAdd =
            List.map (\parameterId -> { network = parameterId, role = ElementAttributes.RoleUnknown }) roleIdsToAdd

        roles =
            rolesWithoutRemoved ++ rolesToAdd
    in
        { node | roles = roles }


dataModelToModel : DataModel -> Model -> Model
dataModelToModel dm model =
    let
        ln =
            List.map (updateRoles dm.parameters) (List.map dataNodeToNode dm.nodes)

        le =
            List.map dataEdgeToEdge dm.edges

        newId =
            getCurIdFromDataModel dm
    in
        { nodes = ln
        , edges = le
        , parameters = dm.parameters
        , curNodeId = newId
        , groups = dm.groups
        , geometries = dm.geometries
        , lightedGroup = dm.lightedGroup
        , lightedGeometry = dm.lightedGeometry
        , selectedParameters = dm.selectedParameters
        , mustLayout = False
        , layouts = dm.layouts
        , geometryLayouts = dm.geometryLayouts
        , lightLayout = dm.lightLayout
        , rootBubbleLayout = dm.rootBubbleLayout
        , mask = dm.mask
        , geometryImage = Nothing
        }


getNodeIdentifier : Model -> Model
getNodeIdentifier model =
    let
        newId =
            model.curNodeId + 1
    in
        { model | curNodeId = newId }


getNodeListFromName : String -> List Node -> List Node
getNodeListFromName s list =
    List.filter (\x -> x.name == s) list


getNodeFromId : Identifier -> List Node -> Maybe Node
getNodeFromId id list =
    case list of
        x :: xs ->
            case x.id == id of
                True ->
                    Just x

                False ->
                    getNodeFromId id xs

        [] ->
            Nothing


getParentFromNodeId : Maybe Identifier -> List Node -> Maybe Identifier
getParentFromNodeId maybe_idx nodes =
    case maybe_idx of
        Nothing ->
            Nothing

        Just idx ->
            let
                maybe_n =
                    getNodeFromId idx nodes

                parent =
                    case maybe_n of
                        Nothing ->
                            Nothing

                        Just n ->
                            n.parent
            in
                parent


getEdgeFromId : Identifier -> List Edge -> Maybe Edge
getEdgeFromId id list =
    case list of
        x :: xs ->
            case x.id == id of
                True ->
                    Just x

                False ->
                    getEdgeFromId id xs

        [] ->
            Nothing


getEdgeFromNodesId : Identifier -> Identifier -> List Edge -> Maybe Edge
getEdgeFromNodesId ids idt list =
    case list of
        x :: xs ->
            case (x.source == ids && x.target == idt) || (x.source == idt && x.target == ids) of
                True ->
                    Just x

                False ->
                    getEdgeFromNodesId ids idt xs

        [] ->
            Nothing


getEdgeIdFromNodesId : Identifier -> Identifier -> List Edge -> Maybe Identifier
getEdgeIdFromNodesId ids idt list =
    case (getEdgeFromNodesId ids idt list) of
        Nothing ->
            Nothing

        Just edge ->
            Just edge.id


getEdgeFromNodesName : String -> String -> Model -> Maybe Edge
getEdgeFromNodesName src target model =
    let
        m_nsrc =
            getNodeFromName src model.nodes

        m_ntarget =
            getNodeFromName target model.nodes

        m_edge =
            case ( m_nsrc, m_ntarget ) of
                ( Just nsrc, Just ntarget ) ->
                    getEdgeFromNodesId nsrc.id ntarget.id model.edges

                _ ->
                    Nothing
    in
        m_edge


getNodeFromNameAndParent : String -> Maybe Identifier -> List Node -> Maybe Node
getNodeFromNameAndParent s m_p list =
    case list of
        x :: xs ->
            case (x.name == s && x.parent == m_p) of
                True ->
                    Just x

                False ->
                    getNodeFromNameAndParent s m_p xs

        [] ->
            Nothing


getNodeIdFromNameAndParent : String -> Maybe Identifier -> List Node -> Maybe Identifier
getNodeIdFromNameAndParent s m_p list =
    case list of
        x :: xs ->
            case (x.name == s && x.parent == m_p) of
                True ->
                    Just x.id

                False ->
                    getNodeIdFromNameAndParent s m_p xs

        [] ->
            Nothing


getNodeFromName : String -> List Node -> Maybe Node
getNodeFromName s list =
    case list of
        x :: xs ->
            case x.name == s of
                True ->
                    Just x

                False ->
                    getNodeFromName s xs

        [] ->
            Nothing


getNodeNameFromId : Identifier -> List Node -> Maybe String
getNodeNameFromId id list =
    case list of
        x :: xs ->
            case x.id == id of
                True ->
                    Just x.name

                False ->
                    getNodeNameFromId id xs

        [] ->
            Nothing


getNodeIdFromName : String -> List Node -> Maybe Identifier
getNodeIdFromName s list =
    case list of
        x :: xs ->
            case x.name == s of
                True ->
                    Just x.id

                False ->
                    getNodeIdFromName s xs

        [] ->
            Nothing


nodeHasParent : Node -> Bool
nodeHasParent n =
    case n.parent of
        Nothing ->
            False

        _ ->
            True


createProperty : String -> Model -> Model
createProperty s model =
    case LinkParameters.getPropertyIdFromName s model.parameters of
        Nothing ->
            createProperty_ s model

        Just id ->
            model


addNetworkToRoles : LinkParameters.Property -> Node -> Node
addNetworkToRoles parameter node =
    let
        newRole =
            { network = parameter.id
            , role = ElementAttributes.RoleUnknown
            }

        roles =
            node.roles ++ [ newRole ]
    in
        { node | roles = roles }


createProperty_ : String -> Model -> Model
createProperty_ s model =
    let
        m1 =
            getNodeIdentifier model

        parameter =
            (LinkParameters.property m1.curNodeId s)

        newParameters =
            parameter :: m1.parameters

        nodes =
            List.map (addNetworkToRoles parameter) m1.nodes
    in
        { m1 | parameters = newParameters, nodes = nodes }


removeNetworkFromRoles : LinkParameters.Property -> Node -> Node
removeNetworkFromRoles parameter node =
    let
        roles =
            List.filter (\role -> (role.network /= parameter.id)) node.roles
    in
        { node | roles = roles }


deleteProperty : String -> Model -> Model
deleteProperty s model =
    let
        maybe_param =
            LinkParameters.getPropertyFromName s model.parameters

        newModel =
            case maybe_param of
                Nothing ->
                    model

                Just p ->
                    let
                        newParameters =
                            List.filter (\x -> not (x == p)) model.parameters

                        nodes =
                            List.map (removeNetworkFromRoles p) model.nodes
                    in
                        { model | parameters = newParameters, nodes = nodes }
    in
        newModel


createGroupProperty : String -> Model -> Model
createGroupProperty s model =
    let
        m1 =
            getNodeIdentifier model

        fc =
            Groups.property m1.curNodeId s

        newGroups =
            fc :: m1.groups
    in
        { m1 | groups = newGroups }


deleteGroupProperty : String -> Model -> Model
deleteGroupProperty s model =
    let
        maybe_group =
            Groups.getPropertyFromName s model.groups

        newModel =
            case maybe_group of
                Nothing ->
                    model

                Just p ->
                    let
                        newGroups =
                            List.filter (\x -> not (x == p)) model.groups

                        newNodes =
                            List.map (\x -> { x | group = Set.remove p.id x.group }) model.nodes

                        newEdges =
                            TightnessActions.removeAllTightness p.id model.edges
                    in
                        { model | groups = newGroups, nodes = newNodes, edges = newEdges }
    in
        newModel


makeNewNode : String -> String -> Model -> ( Node, Model )
makeNewNode name pname model =
    let
        m1 =
            getNodeIdentifier model

        pId =
            getNodeIdFromName pname m1.nodes

        newNode =
            --{ id = m1.curNodeId, name = name, parent = pId }
            Node.node m1.curNodeId name pId
    in
        ( newNode, m1 )


addNewNodeToModel : String -> String -> Model -> Model
addNewNodeToModel name parent model =
    let
        ( newNode, m1 ) =
            makeNewNode name parent model

        newNodes =
            (::) newNode m1.nodes
    in
        { m1 | nodes = newNodes }


isNodeIdPresent : Identifier -> List Node -> Bool
isNodeIdPresent id list =
    case list of
        x :: xs ->
            case x.id == id of
                True ->
                    True

                False ->
                    isNodeIdPresent id xs

        [] ->
            False


isNamePresent : String -> List Node -> Bool
isNamePresent s l =
    case l of
        x :: xs ->
            case x.name == s of
                True ->
                    True

                False ->
                    isNamePresent s xs

        [] ->
            False


isNodePresent : Node -> List Node -> Bool
isNodePresent n list =
    case list of
        x :: xs ->
            case x.id == n.id of
                True ->
                    True

                False ->
                    isNodePresent n xs

        [] ->
            False


isIdPresentInList : Identifier -> List Identifier -> Bool
isIdPresentInList id list =
    case list of
        x :: xs ->
            case x == id of
                True ->
                    True

                False ->
                    isIdPresentInList id xs

        [] ->
            False


isEdgePresent : Edge -> List Edge -> Bool
isEdgePresent e list =
    case list of
        [] ->
            False

        x :: xs ->
            case Link.isEqual x e of
                True ->
                    True

                False ->
                    isEdgePresent e xs


anyEdgeDoublon : List Edge -> Bool
anyEdgeDoublon list =
    case list of
        [] ->
            False

        x :: xs ->
            case isEdgePresent x xs of
                True ->
                    True

                False ->
                    anyEdgeDoublon xs


anyLink : List Node -> Node -> List Edge -> Bool
anyLink list n edges =
    case list of
        [] ->
            False

        x :: xs ->
            case isEdgePresent (Link.link x.id n.id) edges of
                -- { id = 0, source = x.id, target = n.id }
                True ->
                    True

                False ->
                    anyLink xs n edges


anyLinks : List Node -> List Node -> List Edge -> Bool
anyLinks l1 list edges =
    case list of
        [] ->
            False

        x :: xs ->
            case anyLink l1 x edges of
                True ->
                    True

                False ->
                    anyLinks l1 xs edges


anyLinkParameter : Identifier -> List Node -> Node -> List Edge -> Bool
anyLinkParameter idx list n edges =
    case list of
        [] ->
            False

        x :: xs ->
            let
                m_edge =
                    getEdgeFromNodesId x.id n.id edges

                b =
                    case m_edge of
                        Nothing ->
                            False

                        Just edge ->
                            Link.isActive idx edge

                b1 =
                    case b of
                        True ->
                            True

                        False ->
                            anyLinkParameter idx xs n edges
            in
                b1


anyLinksParameter : Identifier -> List Node -> List Node -> List Edge -> Bool
anyLinksParameter idx l1 list edges =
    case list of
        [] ->
            False

        x :: xs ->
            case anyLinkParameter idx l1 x edges of
                True ->
                    True

                False ->
                    anyLinksParameter idx l1 xs edges


edgeST : Node -> Node -> Edge
edgeST n m =
    --{ id = 0, source = n.id, target = m.id }
    Link.link n.id m.id


childs : Node -> List Node -> List Node
childs n list =
    List.filter (\x -> x.parent == Just n.id) list


bros : Node -> List Node -> List Node
bros n list =
    List.filter (\x -> (not (x.id == n.id)) && (x.parent == n.parent)) list


nodeListSameParent_ : List Node -> Maybe Identifier -> Bool -> ( Bool, Maybe Identifier )
nodeListSameParent_ list m_p b =
    case list of
        [] ->
            ( b, m_p )

        x :: xs ->
            let
                res =
                    case m_p == x.parent of
                        False ->
                            ( False, m_p )

                        True ->
                            nodeListSameParent_ xs m_p True
            in
                res


nodeListSameParent : List Node -> ( Bool, Maybe Identifier )
nodeListSameParent list =
    case list of
        [] ->
            ( False, Nothing )

        x :: xs ->
            nodeListSameParent_ xs x.parent True


getLayoutFromNodeIdAndList_ : Identifier -> List NodeLayout -> Maybe Layout
getLayoutFromNodeIdAndList_ id list =
    case list of
        [] ->
            Nothing

        x :: xs ->
            case x.id == id of
                True ->
                    (Just x.layout)

                False ->
                    (getLayoutFromNodeIdAndList_ id xs)


getLayoutFromNodeId : Identifier -> Model -> Maybe Layout
getLayoutFromNodeId id model =
    getLayoutFromNodeIdAndList_ id model.layouts


getGeometryLayoutFromId : Identifier -> Model -> Maybe Layout
getGeometryLayoutFromId id model =
    getLayoutFromNodeIdAndList_ id model.geometryLayouts


setLayoutToNodes : Layout -> Model -> Model
setLayoutToNodes layout model =
    case layout of
        [] ->
            model

        x :: xs ->
            let
                m_n =
                    getNodeFromId x.id model.nodes

                newModel =
                    case m_n of
                        Nothing ->
                            model

                        Just n ->
                            let
                                newNodes =
                                    List.map
                                        (\u ->
                                            case u.id == n.id of
                                                True ->
                                                    { u | position = x.position }

                                                False ->
                                                    u
                                        )
                                        model.nodes
                            in
                                { model | nodes = newNodes }
            in
                setLayoutToNodes xs newModel


isLayoutPresent : Identifier -> List NodeLayout -> Bool
isLayoutPresent id list =
    case list of
        [] ->
            False

        x :: xs ->
            case x.id == id of
                True ->
                    True

                False ->
                    isLayoutPresent id xs


triOneNode_ : List Node -> Model -> List Node
triOneNode_ list model =
    case list of
        [] ->
            []

        x :: xs ->
            let
                lx =
                    [ x ] ++ triOneNode_ (childs x model.nodes) model
            in
                List.append lx (triOneNode_ xs model)


triN : List Node -> List Node -> Model -> List Node
triN list todo model =
    case todo of
        [] ->
            list

        x :: xs ->
            case isNodePresent x list of
                True ->
                    triN list xs model

                False ->
                    triN (List.append list (triOneNode_ [ x ] model)) xs model


triNodes : Model -> Model
triNodes model =
    model


getCurIdFromModel : Model -> Identifier
getCurIdFromModel model =
    let
        nMax =
            List.foldr max 0 (List.map (\x -> x.id) model.nodes)

        eMax =
            List.foldr max 0 (List.map (\x -> x.id) model.edges)

        pMax =
            List.foldr max 0 (List.map (\x -> x.id) model.parameters)

        gMax =
            List.foldr max 0 (List.map (\x -> x.id) model.groups)

        iMax =
            List.foldr max 0 [ gMax, pMax, eMax, nMax ]
    in
        iMax


getCurIdFromDataModel : DataModel -> Identifier
getCurIdFromDataModel dm =
    let
        nMax =
            List.foldr max 0 (List.map (\x -> x.data.id) dm.nodes)

        eMax =
            List.foldr max 0 (List.map (\x -> x.data.id) dm.edges)

        pMax =
            List.foldr max 0 (List.map (\x -> x.id) dm.parameters)

        gMax =
            List.foldr max 0 (List.map (\x -> x.id) dm.groups)

        iMax =
            List.foldr max 0 [ gMax, pMax, eMax, nMax ]
    in
        iMax



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

geometries:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createGeometry : String -> Model -> Model
createGeometry s model =
    let
        m1 =
            getNodeIdentifier model

        new_geometries =
            (Geometries.property m1.curNodeId s) :: m1.geometries
    in
        { m1 | geometries = new_geometries }


deleteGeometry : String -> Model -> Model
deleteGeometry s model =
    let
        maybe_geometry =
            Geometries.getPropertyIdFromName s model.geometries

        newModel =
            case maybe_geometry of
                Nothing ->
                    model

                Just p ->
                    let
                        newGeometries =
                            List.filter (\x -> not (x.id == p)) model.geometries

                        newNodes =
                            List.map (\x -> Node.removeGeometry p x) model.nodes

                        --
                        -- newEdges =
                        --     TightnessActions.removeAllTightness p model.edges
                    in
                        { model
                            | geometries =
                                newGeometries
                            , nodes =
                                newNodes
                                -- , edges = newEdges
                        }
    in
        newModel
