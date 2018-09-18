module DataModelActions
    exposing
        ( createNode
        , createLink
        , createParameter
        , createGroup
        , createGeometry
        , deleteEdge
        , deleteNode
        , deleteParameter
        , deleteGroup
        , deleteGeometry
        , renameNode
        , updateAttribute
        , updateNodeRoles
        , updateState
        , lowestLevelEdges
        , updateProperty
        , groupNodes
        , updateNodeGroupProperty
        , updateNodeGeometryProperty
        , highLightGroup
        , selectedParameters
        , updateNodesPosition
        , updateTightnessForGroup
        , updateLayoutFromNodeId
        , updateGeometryLayoutFromId
        , updateLightLayout
        , updateOutpowered
        , getAscendantName
        , insertMask
        , removeMask
        , isMasked
        , insertFromTmp
        , sendGeometryName
        , blow
        , unblowAll
        )

import DataModel exposing (Model, isNodeIdPresent)
import Identifier exposing (Identifier)
import Position exposing (Position, NodePosition)
import Node exposing (Node, initRoles)
import Link exposing (Edge)
import ElementAttributes exposing (..)
import ModelManagement
import LinkParametersActions
import LinkParameters
import Groups
import Set
import GroupsActions
import Tightness
import TightnessActions
import Layout exposing (Layout, NodeLayout)
import Mask
import TranslateTmpDataModel
import Geometries
import GeometryActions
import Propagation


{--
  createNode :
--}


createNode : String -> Maybe Identifier -> Model -> Model
createNode name m_parent model =
    let
        newDataModel =
            DataModel.getNodeIdentifier model

        newId =
            newDataModel.curNodeId

        node =
            (Node.node newId name m_parent)

        nodeWithRoles =
            initRoles node model.parameters

        newNodes =
            nodeWithRoles :: newDataModel.nodes
    in
        { newDataModel | nodes = newNodes }



{--
  createLink :
    asc ( src ) = [x1, x2, x3, ..., xn, Pcommun]
    asc ( target ) = [ y1, y2, .. , ym, Pcommun]

    avec PCommun peut valoir Nothing

    links = [ (x1,y1), (x1,y2), .., (x1,ym), (x2,y1), .., (x2,ym), .., (xn,x1), ..,(xn,ym)]
    On trouve m * n liens
--}


createLink : Identifier -> Identifier -> Model -> Model
createLink s t model =
    let
        ns =
            (DataModel.getNodeFromId s model.nodes)

        nt =
            (DataModel.getNodeFromId t model.nodes)

        newModel =
            case ( ns, nt ) of
                ( Just ns1, Just nt1 ) ->
                    createLink_ ns1 nt1 model

                ( _, _ ) ->
                    model
    in
        newModel


createLink_ : Node -> Node -> Model -> Model
createLink_ ns1 nt1 model =
    let
        commonParent =
            ModelManagement.findCommonParent model.nodes ns1 nt1

        ldt1 =
            (ModelManagement.getAscendants model.nodes nt1 commonParent)

        lds1 =
            (ModelManagement.getAscendants model.nodes ns1 commonParent)

        m2 =
            createLinkEdgeForLists_ lds1 ldt1 model
    in
        m2


createLinkEdgeForLists_ : List Node -> List Node -> Model -> Model
createLinkEdgeForLists_ ls lt model =
    case ls of
        [] ->
            model

        x :: xs ->
            createLinkEdgeForLists_ xs lt (createAtomicEdgeForList_ lt x.id model)


createAtomicEdge_ : Identifier -> Identifier -> Model -> Model
createAtomicEdge_ src dest model =
    let
        edge =
            (Link.link src dest)

        dataModelNewId =
            case (DataModel.isEdgePresent edge model.edges) of
                True ->
                    model

                False ->
                    let
                        m1 =
                            DataModel.getNodeIdentifier model

                        e1 =
                            { edge | id = m1.curNodeId }

                        newEdges =
                            e1 :: m1.edges
                    in
                        { m1 | edges = newEdges }
    in
        dataModelNewId


createAtomicDoubleEdge_ : Identifier -> Identifier -> Model -> Model
createAtomicDoubleEdge_ src dest model =
    createAtomicEdge_ src dest model


createAtomicEdgeForList_ : List Node -> Identifier -> Model -> Model
createAtomicEdgeForList_ list dest model =
    case list of
        x :: xs ->
            let
                m1 =
                    createAtomicDoubleEdge_ x.id dest model
            in
                createAtomicEdgeForList_ xs dest m1

        [] ->
            model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

renameNode:
rename node select dans le Model.dataModel

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


renameNode_ : Node -> String -> Node
renameNode_ n s =
    { n | name = s }


process_ : String -> Maybe Identifier -> Node -> Node
process_ s id n =
    let
        n1 =
            case id of
                Nothing ->
                    n

                Just i ->
                    case n.id == i of
                        True ->
                            { n | name = s }

                        False ->
                            n
    in
        n1


renameNodeInList_ : String -> Maybe Identifier -> List Node -> List Node
renameNodeInList_ s id list =
    List.map (process_ s id) list


renameNode : String -> Maybe Identifier -> Model -> Model
renameNode s m_nId model =
    let
        newNodes =
            (renameNodeInList_ s m_nId model.nodes)
    in
        { model | nodes = newNodes }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteEdge : id model
id : identifier du edge a supprimer


deletEdge: src -> dest
delteEdge : dest -> src

deleteDown
deleteAllEdges src (descendants dest)
on delete dans les 2 sens src -> d[i], et d[i] -> src


deleteUp
deleteAllEdges src (ascendants dest) si pas de lien (asc enfant) et src
on delete dans les 2 sens src -> a[i], et a[i] -> src


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


deleteEdge : Identifier -> Model -> Model
deleteEdge id model =
    let
        -- recherche edge associé a id
        edge =
            DataModel.getEdgeFromId id model.edges

        m1 =
            case edge of
                Nothing ->
                    model

                Just edge1 ->
                    let
                        -- recherche noeud source
                        maybe_nsrc =
                            DataModel.getNodeFromId edge1.source model.nodes

                        -- recherche noeud target
                        maybe_ntarget =
                            DataModel.getNodeFromId edge1.target model.nodes

                        -- unActivate all parameters for edge
                        m20 =
                            LinkParametersActions.unActivateAllParameters edge1 model

                        m2 =
                            case ( maybe_nsrc, maybe_ntarget ) of
                                ( Just nsrc, Just ntarget ) ->
                                    let
                                        m3 =
                                            deleteEdge_ nsrc ntarget m20

                                        -- m4 =
                                        --     deleteEdge_ ntarget nsrc m3
                                    in
                                        m3

                                ( _, _ ) ->
                                    delJustEdge edge1 m20
                    in
                        m2
    in
        m1


deleteEdge_ : Node -> Node -> Model -> Model
deleteEdge_ n ext model =
    let
        m1 =
            deleteEdgeDown n ext model

        m2 =
            deleteEdgeUp n ext m1
    in
        m2


deleteEdgeDown : Node -> Node -> Model -> Model
deleteEdgeDown n m model =
    let
        n_descendants =
            ModelManagement.getDescendantsFromN model.nodes n

        m_descendants =
            ModelManagement.getDescendantsFromN model.nodes m

        m1 =
            delEdgeDownForLists_ n_descendants m_descendants model
    in
        m1


delEdgeDownForLists_ : List Node -> List Node -> Model -> Model
delEdgeDownForLists_ lx ly model =
    case lx of
        [] ->
            model

        x :: xs ->
            delEdgeDownForLists_ xs ly (delEdgeDownForList_ x ly model)


delEdgeDownForList_ : Node -> List Node -> Model -> Model
delEdgeDownForList_ n list model =
    case list of
        [] ->
            model

        x :: xs ->
            delEdgeDownForList_ n xs (delEdgeFromModel_ n x model)


delEdgeFromModel_ : Node -> Node -> Model -> Model
delEdgeFromModel_ n m model =
    let
        m_e =
            DataModel.getEdgeFromNodesId n.id m.id model.edges

        newModel =
            case m_e of
                Nothing ->
                    model

                Just edge ->
                    delJustEdge edge model
    in
        newModel


delEdge : Edge -> List Edge -> List Edge
delEdge edge list =
    List.filter (\x -> not ((x.source == edge.source && x.target == edge.target) || (x.target == edge.source && x.source == edge.target))) list



{--
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


--}


deleteAscN : Node -> List Node -> Model -> Model
deleteAscN n asc_m model =
    case asc_m of
        [] ->
            model

        x :: xs ->
            let
                m1 =
                    case canDelete n x model of
                        True ->
                            let
                                m_e =
                                    DataModel.getEdgeFromNodesId n.id x.id model.edges

                                m2 =
                                    case m_e of
                                        Nothing ->
                                            model

                                        Just edge ->
                                            delJustEdge edge model
                            in
                                m2

                        False ->
                            model
            in
                deleteAscN n xs m1


delJustEdge : Edge -> Model -> Model
delJustEdge edge model =
    let
        newEdges =
            (delEdge edge model.edges)
    in
        { model | edges = newEdges }


deleteAsc : List Node -> List Node -> Model -> Model
deleteAsc asc_n asc_m model =
    case asc_n of
        [] ->
            model

        x :: xs ->
            deleteAsc xs asc_m (deleteAscN x asc_m model)


deleteEdgeWithAsc : Node -> Node -> Model -> Model
deleteEdgeWithAsc n m model =
    let
        commonParent =
            ModelManagement.findCommonParent model.nodes n m

        asc_n =
            ModelManagement.getAscendants model.nodes n commonParent

        asc_m =
            ModelManagement.getAscendants model.nodes m commonParent
    in
        deleteAsc asc_n asc_m model


canDelete : Node -> Node -> Model -> Bool
canDelete n m model =
    let
        childs_n =
            DataModel.childs n model.nodes

        childs_plus_n =
            n :: childs_n

        childs_m =
            DataModel.childs m model.nodes

        childs_plus_m =
            m :: childs_m

        b1 =
            DataModel.anyLinks childs_plus_m childs_n model.edges

        b2 =
            DataModel.anyLinks childs_plus_n childs_m model.edges

        b =
            not (b1 || b2)
    in
        b



{--
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////




--}


deleteEdgeUp : Node -> Node -> Model -> Model
deleteEdgeUp n m model =
    let
        m_e =
            DataModel.getEdgeFromNodesId n.id m.id model.edges

        m3 =
            case m_e of
                Nothing ->
                    model

                Just edge ->
                    let
                        m0 =
                            delJustEdge edge model

                        m2 =
                            deleteEdgeWithAsc n m m0
                    in
                        m2
    in
        m3



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteNode :
rechercher tous les descendants de n dans la liste des nodes
pour chaque element, appeler deleteNode_

deleteNode_ :
pour tous les liens / source == n ou dest == n, appeler deleteEdge
supprimer n de la liste

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


delJustNode : Node -> Model -> Model
delJustNode n model =
    let
        newNodes =
            (delNode n model.nodes)
    in
        { model | nodes = newNodes }


delNode : Node -> List Node -> List Node
delNode n nodes =
    List.filter (\x -> not (n.id == x.id)) nodes


deleteNode : Identifier -> Model -> Model
deleteNode id model =
    let
        maybe_n =
            DataModel.getNodeFromId id model.nodes

        m1 =
            case maybe_n of
                Just n ->
                    let
                        descendants =
                            ModelManagement.getDescendantsFromN model.nodes n

                        m2 =
                            deleteEdgesAndNodeFromListNode_ descendants model
                    in
                        m2

                Nothing ->
                    model
    in
        m1


deleteEdgesAndNodeFromListNode_ : List Node -> Model -> Model
deleteEdgesAndNodeFromListNode_ list model =
    case list of
        x :: xs ->
            let
                m1 =
                    deleteEdgesAndNode_ x model
            in
                deleteEdgesAndNodeFromListNode_ xs m1

        [] ->
            model


deleteEdgesAndNode_ : Node -> Model -> Model
deleteEdgesAndNode_ n model =
    let
        edgesToDelete =
            List.filter (\x -> ((x.source == n.id) || (x.target == n.id))) model.edges

        m1 =
            deleteEdgeFromList_ edgesToDelete model

        m2 =
            delJustNode n m1
    in
        m2


deleteEdgeFromList_ : List Edge -> Model -> Model
deleteEdgeFromList_ list model =
    case list of
        x :: xs ->
            deleteEdgeFromList_ xs (deleteEdge x.id model)

        [] ->
            model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

lowestLevelEdges :

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


isLowestLevel : Edge -> Model -> Bool
isLowestLevel edge model =
    let
        m_n =
            DataModel.getNodeFromId edge.source model.nodes

        m_p =
            DataModel.getNodeFromId edge.target model.nodes

        b =
            case ( m_n, m_p ) of
                ( Just n, Just p ) ->
                    canDelete n p model

                ( _, _ ) ->
                    False
    in
        b


lowestLevelEdges : Model -> List Edge
lowestLevelEdges model =
    List.filter (\x -> isLowestLevel x model) model.edges



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateAttribute :

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


fnode_ : Identifier -> String -> Node -> Node
fnode_ id s n =
    let
        newNode =
            case n.id == id of
                True ->
                    case String.length s of
                        0 ->
                            { n | attribut = Nothing }

                        _ ->
                            { n | attribut = Just s }

                False ->
                    n
    in
        newNode


fedge_ : Identifier -> String -> Edge -> Edge
fedge_ id s e =
    let
        newEdge =
            case e.id == id of
                True ->
                    case String.length s of
                        0 ->
                            { e | attribut = Nothing }

                        _ ->
                            { e | attribut = Just s }

                False ->
                    e
    in
        newEdge


updateAttribute : Maybe Identifier -> String -> Model -> Model
updateAttribute m_id s dataModel =
    case m_id of
        Nothing ->
            dataModel

        Just id ->
            let
                newNodes =
                    List.map (\x -> (fnode_ id s x)) dataModel.nodes

                newEdges =
                    List.map (\x -> fedge_ id s x) dataModel.edges
            in
                { dataModel | nodes = newNodes, edges = newEdges }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateNodeRole :

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


updateRoles : Roles -> Identifier -> Role -> Roles
updateRoles roles network newRole =
    let
        updateRoleInNetwork item =
            if item.network == network then
                { item | role = newRole }
            else
                item
    in
        List.map updateRoleInNetwork roles


replaceNodeRoles : Identifier -> Identifier -> Role -> Node -> Node
replaceNodeRoles id networkId role node =
    case node.id == id of
        True ->
            { node | roles = updateRoles node.roles networkId role }

        False ->
            node


updateNodeRoles : Maybe Identifier -> Identifier -> Role -> Model -> Model
updateNodeRoles id networkId role dataModel =
    case id of
        Nothing ->
            dataModel

        Just id ->
            let
                newNodes =
                    List.map (\x -> (replaceNodeRoles id networkId role x)) dataModel.nodes
            in
                { dataModel | nodes = newNodes }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateNodeState :

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


f_replaceNodeState : Identifier -> ElementState -> Node -> Node
f_replaceNodeState id elemState node =
    let
        newNode =
            case node.id == id of
                True ->
                    { node | state = elemState }

                False ->
                    node
    in
        newNode


f_replaceEdgeState : Identifier -> ElementState -> Edge -> Edge
f_replaceEdgeState id elemState edge =
    let
        newEdge =
            case edge.id == id of
                True ->
                    { edge | state = elemState }

                False ->
                    edge
    in
        newEdge


updateState : Maybe Identifier -> ElementState -> Model -> Model
updateState m_id elemState dataModel =
    case m_id of
        Nothing ->
            dataModel

        Just id ->
            let
                newNodes =
                    List.map (\x -> (f_replaceNodeState id elemState x)) dataModel.nodes

                newEdges =
                    List.map (\x -> (f_replaceEdgeState id elemState x)) dataModel.edges
            in
                { dataModel | nodes = newNodes, edges = newEdges }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateProperty :

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


updateProperty : Edge -> String -> Model -> Model
updateProperty edge s model =
    let
        maybe_propId =
            LinkParameters.getPropertyIdFromName s model.parameters

        newModel =
            case maybe_propId of
                Nothing ->
                    model

                Just propId ->
                    let
                        m1 =
                            case Link.isActive propId edge of
                                False ->
                                    LinkParametersActions.activateParameter propId edge model

                                True ->
                                    LinkParametersActions.unActivateParameter propId edge model
                    in
                        m1
    in
        newModel



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createGroup:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createGroup : String -> Model -> Model
createGroup s model =
    DataModel.createGroupProperty s model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteGroup:


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


deleteGroup : String -> Model -> Model
deleteGroup s model =
    DataModel.deleteGroupProperty s model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createGeometry:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createGeometry : String -> Model -> Model
createGeometry s model =
    DataModel.createGeometry s model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteGeometry:


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


deleteGeometry : String -> Model -> Model
deleteGeometry s model =
    DataModel.deleteGeometry s model


updateNodeGeometryProperty : Node -> String -> Model -> Model
updateNodeGeometryProperty n s model =
    let
        m_id =
            Geometries.getPropertyIdFromName s model.geometries

        m1 =
            case m_id of
                Nothing ->
                    model

                Just id ->
                    let
                        newModel =
                            case Node.hasGeometry id n of
                                False ->
                                    GeometryActions.addGeometryToNode id n model

                                True ->
                                    GeometryActions.deleteGeometryFromNode id n model
                    in
                        newModel
    in
        m1



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createParameter:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createParameter : String -> Model -> Model
createParameter s model =
    DataModel.createProperty s model



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteParameter:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


desactivateParameterOnAllLinks : Identifier -> Model -> Model
desactivateParameterOnAllLinks idx model =
    let
        newEdges =
            List.map (\x -> Link.unActivate idx x) model.edges
    in
        { model | edges = newEdges }


deleteParameter : String -> Model -> Model
deleteParameter s model =
    let
        maybe_parameter =
            (LinkParameters.getPropertyIdFromName s model.parameters)

        m1 =
            case maybe_parameter of
                Nothing ->
                    model

                Just p ->
                    let
                        m2 =
                            desactivateParameterOnAllLinks p model

                        newDataModel =
                            (DataModel.deleteProperty s m2)
                    in
                        newDataModel
    in
        m1



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

groupNodes:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateParameters_ : Edge -> Model -> Model
updateParameters_ edge model =
    -- on ajoute les parametres actifs de edge aux parametres des edges égaux du modele
    let
        newEdges =
            List.map
                (\x ->
                    case Link.isEqual x edge of
                        True ->
                            Link.updateActivePoperties edge.parameters x

                        False ->
                            x
                )
                model.edges
    in
        { model | edges = newEdges }


cloneEdge_ : Edge -> Model -> Model
cloneEdge_ edge model =
    -- si edge existe dans le modele, on concatene ses parametres avec ceux de edge
    -- sinon on construit un nouveau lien dans le modele avec les caracteristiques de edge
    -- (source, target, parameters, attribut=Nothing)
    -- cette fonction differe de createAtomicEdge_ a cause des parametres
    let
        dataModelNewId =
            case (DataModel.isEdgePresent edge model.edges) of
                True ->
                    updateParameters_ edge model

                False ->
                    let
                        dm1 =
                            DataModel.getNodeIdentifier model

                        newEdges =
                            { edge | id = dm1.curNodeId, attribut = Nothing } :: dm1.edges

                        dm11 =
                            { dm1 | edges = newEdges }
                    in
                        dm11
    in
        dataModelNewId


isDescendantOneOfList_ : Identifier -> List Node -> Model -> Bool
isDescendantOneOfList_ id list model =
    case list of
        [] ->
            False

        x :: xs ->
            let
                b =
                    case DataModel.isNodeIdPresent id (ModelManagement.getDescendantsFromN model.nodes x) of
                        True ->
                            True

                        False ->
                            isDescendantOneOfList_ id xs model
            in
                b


makeGroupNodes_ : List Node -> String -> Maybe Identifier -> Model -> Model
makeGroupNodes_ list s m_p model =
    let
        -- create un father for all nodes in list
        -- id for new father is model.curNodeId
        m1 =
            createNode s m_p model

        fatherId =
            m1.curNodeId

        -- modify father to new father for all nodes in list
        newNodes =
            List.map
                (\x ->
                    case (DataModel.isNodePresent x list) of
                        True ->
                            { x | parent = Just fatherId }

                        False ->
                            x
                )
                m1.nodes

        edges1 =
            -- filter les liens dont la source est un bloc a grouper et dont target est externe aux blocs à grouper
            List.filter
                (\x ->
                    (DataModel.isNodeIdPresent x.source list)
                        && not (isDescendantOneOfList_ x.target list model)
                )
                m1.edges

        edges11 =
            -- on redirige la source en fatherId
            List.map (\x -> { x | source = fatherId }) edges1

        edges2 =
            -- filter les liens dont la target est un bloc a grouper et dont source est externe aux blocs à grouper
            List.filter
                (\x ->
                    (DataModel.isNodeIdPresent x.target list)
                        && not (isDescendantOneOfList_ x.source list model)
                )
                m1.edges

        edges21 =
            -- on redirige la target en fatherId
            List.map (\x -> { x | target = fatherId }) edges2

        edgesTocreate =
            -- liste des nouveaux liens à creer
            List.append edges11 edges21

        m2 =
            { m1 | nodes = newNodes }

        m3 =
            duplicateEdgesFromList edgesTocreate m2
    in
        m3


groupNodes : List Node -> String -> Model -> Model
groupNodes list s model =
    let
        ( condition, parent ) =
            -- les blocs doivent avoir le meme parent
            DataModel.nodeListSameParent list

        m1 =
            case condition of
                False ->
                    model

                True ->
                    makeGroupNodes_ list s parent model
    in
        m1


duplicateEdgesFromList : List Edge -> Model -> Model
duplicateEdgesFromList list model =
    case list of
        [] ->
            model

        x :: xs ->
            let
                m1 =
                    cloneEdge_ x model
            in
                duplicateEdgesFromList xs m1


updateNodeGroupProperty : Node -> String -> Model -> Model
updateNodeGroupProperty n s model =
    let
        m_id =
            Groups.getPropertyIdFromName s model.groups

        m1 =
            case m_id of
                Nothing ->
                    model

                Just id ->
                    let
                        newModel =
                            case Node.inGroup id n of
                                False ->
                                    GroupsActions.addGroupToNode id n model

                                True ->
                                    GroupsActions.deleteGroupFromNode id n model
                    in
                        newModel
    in
        m1


highLightGroup : String -> Model -> Model
highLightGroup s model =
    let
        m_id =
            Groups.getPropertyIdFromName s model.groups

        newModel =
            case m_id of
                Nothing ->
                    model

                Just id ->
                    let
                        -- update du champ model.lightedGroup
                        newLightedGroup =
                            case model.lightedGroup == Just id of
                                True ->
                                    Nothing

                                False ->
                                    Just id

                        filterNodes =
                            List.filter
                                (\x ->
                                    case newLightedGroup of
                                        Nothing ->
                                            False

                                        Just id ->
                                            Set.member id x.group
                                )
                                model.nodes

                        newNodes =
                            List.map
                                (\x ->
                                    case newLightedGroup of
                                        Nothing ->
                                            { x | highLighted = 0 }

                                        Just id ->
                                            case Set.member id x.group of
                                                True ->
                                                    { x | highLighted = 1 }

                                                False ->
                                                    { x | highLighted = 0 }
                                )
                                model.nodes

                        newEdges =
                            List.map
                                (\x ->
                                    case ( DataModel.isNodeIdPresent x.source filterNodes, DataModel.isNodeIdPresent x.target filterNodes ) of
                                        ( True, True ) ->
                                            { x | highLighted = 1 }

                                        ( False, True ) ->
                                            case Tightness.isTightness id x.tightness of
                                                True ->
                                                    { x | highLighted = 2 }

                                                False ->
                                                    { x | highLighted = 3 }

                                        ( True, False ) ->
                                            case Tightness.isTightness id x.tightness of
                                                True ->
                                                    { x | highLighted = 2 }

                                                False ->
                                                    { x | highLighted = 3 }

                                        ( False, False ) ->
                                            { x | highLighted = 0 }
                                )
                                model.edges
                    in
                        { model
                            | nodes = newNodes
                            , edges = newEdges
                            , lightedGroup = newLightedGroup
                        }
    in
        newModel


selectedParameters : String -> Model -> Model
selectedParameters s model =
    let
        m_id =
            LinkParameters.getPropertyIdFromName s model.parameters

        newModel =
            case m_id of
                Nothing ->
                    model

                Just id ->
                    let
                        newSelectedParameters =
                            case (Set.member id model.selectedParameters) of
                                True ->
                                    Set.remove id model.selectedParameters

                                False ->
                                    Set.insert id model.selectedParameters

                        newEdgesFilter =
                            List.filter
                                (\x ->
                                    List.any (\y -> Set.member y x.parameters) (Set.toList newSelectedParameters)
                                )
                                model.edges

                        newEdges =
                            List.map
                                (\x ->
                                    case List.any (\y -> Set.member y x.parameters) (Set.toList newSelectedParameters) of
                                        True ->
                                            { x | highLighted = 1 }

                                        False ->
                                            { x | highLighted = 0 }
                                )
                                model.edges

                        newNodes =
                            List.map
                                (\x ->
                                    case List.any (\y -> y.source == x.id || y.target == x.id) newEdgesFilter of
                                        True ->
                                            { x | highLighted = 1 }

                                        False ->
                                            { x | highLighted = 0 }
                                )
                                model.nodes
                    in
                        { model
                            | selectedParameters = newSelectedParameters
                            , edges = newEdges
                            , nodes = newNodes
                        }
    in
        newModel


updateNodesPosition : List Position.NodePosition -> Model -> Model
updateNodesPosition list model =
    case list of
        [] ->
            model

        y :: ys ->
            let
                newNodes =
                    List.map
                        (\x ->
                            case x.id == y.id of
                                True ->
                                    { x | position = y.position }

                                False ->
                                    x
                        )
                        model.nodes

                m1 =
                    { model | nodes = newNodes, mustLayout = False }
            in
                updateNodesPosition ys m1


updateTightnessForGroup : String -> Identifier -> Model -> Model
updateTightnessForGroup s edgeId model =
    let
        m_group =
            Groups.getPropertyIdFromName s model.groups

        newModel =
            case m_group of
                Nothing ->
                    model

                Just g ->
                    let
                        newEdges =
                            TightnessActions.updateTightnessForEdgeId g edgeId model.edges
                    in
                        { model | edges = newEdges }
    in
        newModel


addLayout_ : Identifier -> Layout -> Model -> Model
addLayout_ i lay model =
    let
        newLayouts =
            { id = i, layout = lay } :: model.layouts
    in
        { model | layouts = newLayouts }


completeMaybeLayout_ : Maybe Layout -> Layout -> Maybe Layout
completeMaybeLayout_ ori new =
    case ori of
        Nothing ->
            Just new

        Just olayout ->
            Just (completeLayout_ olayout new)


isNodePositionMember_ : Layout -> NodePosition -> Bool
isNodePositionMember_ lay np =
    case lay of
        [] ->
            False

        x :: xs ->
            case x.id == np.id of
                True ->
                    True

                False ->
                    isNodePositionMember_ xs np


completeLayoutWithNodePosition_ : Layout -> NodePosition -> Layout
completeLayoutWithNodePosition_ lay np =
    case isNodePositionMember_ lay np of
        True ->
            List.map
                (\x ->
                    case x.id == np.id of
                        True ->
                            np

                        False ->
                            x
                )
                lay

        False ->
            np :: lay


completeLayout_ : Layout -> Layout -> Layout
completeLayout_ ori new =
    -- on enrichit le layout ori avec new.
    -- Les nouveaux elements sont ajoutés.
    -- Les positions des éléments existant sont mises à jour
    case new of
        [] ->
            ori

        x :: xs ->
            completeLayout_ (completeLayoutWithNodePosition_ ori x) xs


updateLayoutFromNodeId : Maybe Identifier -> Layout -> Model -> Model
updateLayoutFromNodeId m_id lay model =
    -- ajout ou update du layout pour le bloc d'indice id
    -- IL FAUDRAIT NETTOYER le layout en verifiant la presence des blocs dans le model
    -- CE NETTOYAGE DEVRAIT ÊTRE FAIT, mais pas nécessairement ici
    case m_id of
        Nothing ->
            { model | rootBubbleLayout = completeMaybeLayout_ model.rootBubbleLayout lay }

        Just id ->
            let
                b =
                    DataModel.isLayoutPresent id model.layouts

                m_l =
                    DataModel.getLayoutFromNodeId id model

                newModel =
                    case m_l of
                        Nothing ->
                            addLayout_ id lay model

                        Just l ->
                            let
                                newLayouts =
                                    List.map
                                        (\x ->
                                            case x.id == id of
                                                True ->
                                                    { x | layout = completeLayout_ x.layout lay }

                                                False ->
                                                    x
                                        )
                                        model.layouts
                            in
                                { model | layouts = newLayouts }
            in
                newModel


addGeometryLayout_ : Identifier -> Layout -> Model -> Model
addGeometryLayout_ i lay model =
    let
        newGeometryLayouts =
            { id = i, layout = lay } :: model.geometryLayouts
    in
        { model | geometryLayouts = newGeometryLayouts }


updateGeometryLayoutFromId : Maybe Identifier -> Layout -> Model -> Model
updateGeometryLayoutFromId m_id lay model =
    case m_id of
        Nothing ->
            model

        Just id ->
            let
                b =
                    DataModel.isLayoutPresent id model.geometryLayouts

                m_l =
                    DataModel.getGeometryLayoutFromId id model

                newModel =
                    case m_l of
                        Nothing ->
                            addGeometryLayout_ id lay model

                        Just l ->
                            let
                                newLayouts =
                                    List.map
                                        (\x ->
                                            case x.id == id of
                                                True ->
                                                    { x | layout = lay }

                                                False ->
                                                    x
                                        )
                                        model.geometryLayouts
                            in
                                { model | geometryLayouts = newLayouts }
            in
                newModel


updateLightLayout : Layout -> Model -> Model
updateLightLayout elements model =
    { model | lightLayout = Just elements }


updateOutpowered : Model -> Model
updateOutpowered model =
    Propagation.propagation model


ascNameFromList_ : List Node -> String -> String
ascNameFromList_ list slash =
    case list of
        [] ->
            ""

        x :: xs ->
            case List.length xs of
                0 ->
                    x.name

                _ ->
                    x.name ++ slash ++ (ascNameFromList_ xs slash)


getAscendantName : Node -> Model -> String
getAscendantName n model =
    let
        list =
            ModelManagement.getAscendants model.nodes n Nothing
    in
        ascNameFromList_ (List.reverse list) "/"


isMasked : Identifier -> Model -> Bool
isMasked id model =
    Mask.member id model.mask


insertMask : Identifier -> Model -> Model
insertMask id model =
    let
        m1 =
            case DataModel.getNodeFromId id model.nodes of
                Just n ->
                    let
                        newMask =
                            Mask.insert n.id model.mask
                    in
                        { model | mask = newMask }

                Nothing ->
                    model
    in
        m1


removeMask : Identifier -> Model -> Model
removeMask id model =
    let
        m1 =
            case DataModel.getNodeFromId id model.nodes of
                Just n ->
                    let
                        newMask =
                            Mask.remove n.id model.mask
                    in
                        { model | mask = newMask }

                Nothing ->
                    model
    in
        m1


filterEdge_ : Edge -> Identifier -> List Node -> Bool
filterEdge_ edge id list =
    let
        m_n =
            DataModel.getNodeFromId id list

        b =
            case m_n of
                Nothing ->
                    True

                Just n ->
                    let
                        l1 =
                            ModelManagement.getAscendants list n Nothing

                        b1 =
                            ((DataModel.isNodeIdPresent edge.source l1) && (edge.target == id))
                                || ((DataModel.isNodeIdPresent edge.target l1) && (edge.source == id))
                    in
                        not b1
    in
        b


createLinksRecursive_ : List Edge -> Model -> Model
createLinksRecursive_ list model =
    case list of
        [] ->
            model

        x :: xs ->
            createLinksRecursive_ xs (createLink x.source x.target model)


createLinks_ : List Edge -> Model -> Model
createLinks_ list model =
    let
        m1 =
            createLinksRecursive_ list model

        m2 =
            LinkParametersActions.activateParameters list m1
    in
        m2


insertFromTmp : Maybe Identifier -> Maybe Identifier -> Model -> Model -> Model
insertFromTmp m_s m_id tmp model =
    -- m_s : maybe identifier du bloc selectionné pour insert
    -- m_id : maybe identifier du bloc à transfèrer
    let
        maxId =
            (DataModel.getCurIdFromModel model) + 1

        tmpDataModel =
            TranslateTmpDataModel.translateDataModel maxId tmp

        m0 =
            case m_id of
                Nothing ->
                    model

                Just n_id ->
                    let
                        -- on translate n_id de maxId suite a appel de translateDataModel
                        newId =
                            (n_id + maxId)

                        n0Nodes =
                            List.map
                                (\x ->
                                    case x.id == newId of
                                        True ->
                                            { x | parent = m_s }

                                        False ->
                                            x
                                )
                                tmpDataModel.nodes

                        n1Nodes =
                            List.concat [ model.nodes, n0Nodes ]

                        m1 =
                            { model | nodes = n1Nodes }

                        m2 =
                            GroupsActions.addGroupsToNodes n0Nodes m1

                        newEdges =
                            List.filter
                                (\x ->
                                    (filterEdge_ x newId m2.nodes)
                                )
                                tmpDataModel.edges

                        newCurId =
                            DataModel.getCurIdFromModel m2

                        m3 =
                            { m2 | curNodeId = newCurId }

                        m4 =
                            createLinks_ newEdges m3
                    in
                        m4
    in
        m0


sendGeometryName : Geometries.Property -> Model -> Model
sendGeometryName element model =
    let
        newGeometries =
            List.map
                (\x ->
                    case x.id == element.id of
                        True ->
                            { x | svg = element.svg }

                        False ->
                            x
                )
                model.geometries
    in
        { model | geometries = newGeometries }


blow : Identifier -> Model -> Model
blow id model =
    case (DataModel.getNodeFromId id model.nodes) of
        Nothing ->
            model

        Just n ->
            -- blow n in nodes
            let
                newNodes =
                    List.map
                        (\x ->
                            case x.id == n.id of
                                True ->
                                    Node.blow x

                                False ->
                                    x
                        )
                        model.nodes
            in
                { model
                    | nodes = newNodes
                }


unblowAll : Model -> Model
unblowAll model =
    { model
        | nodes = List.map (\x -> { x | blow = False }) model.nodes
    }
