module ModelActions
    exposing
        ( createLink
        , createNode
        , createGroup
        , createGeometry
        , dataModelToModel
        , dataImportModelToModel
        , dataImportCsvModelToModel
        , deleteEdge
        , deleteNode
        , deleteGroup
        , deleteGeometry
        , renameNode
        , exportLink
        , updateSelectedFlux
        , createParameter
        , deleteParameter
        , updateAttribute
        , updateNodeType
        , updateState
        , updateProperty
        , undo
        , redo
        , groupNodes
        , updateNodeGroupProperty
        , updateNodeGeometryProperty
        , highLightGroup
        , highLightGeometry
        , selectedParameters
        , updateTightness
        , updateLayoutFromNodeId
        , updateNodesPosition
        , updateLightLayout
        , updateGeometryLayout
        , triNodes
        , getAscendantName
        , searchElement
        , insertKey
        , removeKey
        , mask
        , ctrlC
        , ctrlX
        , ctrlV
        , getNodeViewLabel
        , sendGeometryName
        , loadCsvModel
        , blow
        , getCounterViewLabel
        )

import Identifier exposing (Identifier)
import Link exposing (Edge)
import Node exposing (Node)
import DataModel
import Model exposing (Model)
import LinkParameters
import Set exposing (Set)
import ElementAttributes exposing (..)
import LinkParameters
import DataModelActions
import Scenario
import Player
import DataModelDecoders
import Json.Decode
import SpecialKey
import Keyboard exposing (KeyCode)
import Selection
import Geometries
import Csv
import Search


{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createLink

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}
{--
  createLink :
    asc ( src ) = [x1, x2, x3, ..., xn, Pcommun]
    asc ( target ) = [ y1, y2, .. , ym, Pcommun]

    avec PCommun peut valoir Nothing

    links = [ (x1,y1), (x1,y2), .., (x1,ym), (x2,y1), .., (x2,ym), .., (xn,x1), ..,(xn,ym)]
    On trouve m * n liens
--}


createLink : Identifier -> Identifier -> Model.Model -> Model.Model
createLink s t model =
    let
        newDataModel =
            DataModelActions.createLink s t model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.CreateLink s t) model.undo

        m1 =
            { model
                | selectionType = Model.LINK (DataModel.getEdgeIdFromNodesId s t newDataModel.edges)
                , dataModel = newDataModel
                , undo = newUndo
            }
    in
        m1



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createNode :
creation node et ajout a la liste des nodes dans model.dataModel

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
--}


createNode : Model.Model -> Model.Model
createNode model =
    let
        newName =
            model.input

        -- on prend le parent de nodeViewId
        useParent =
            case model.nodeViewId of
                Nothing ->
                    Nothing

                Just idx ->
                    DataModel.getParentFromNodeId model.nodeViewId model.dataModel.nodes

        -- on corrige le bug de la selection renvoyee par js
        newParent =
            case List.length model.selection > 1 of
                True ->
                    useParent

                False ->
                    case model.selection of
                        x :: xs ->
                            Just x

                        [] ->
                            useParent

        newDataModel =
            DataModelActions.createNode newName newParent model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.CreateNode newName newParent) model.undo
    in
        { model | dataModel = newDataModel, undo = newUndo }



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


deleteEdge : Identifier -> Model.Model -> Model.Model
deleteEdge id model =
    let
        newDataModel =
            DataModelActions.deleteEdge id model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.DeleteLink id) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



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


deleteNode : Identifier -> Model.Model -> Model.Model
deleteNode id model =
    let
        newDataModel =
            DataModelActions.deleteNode id model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.DeleteNode id) model.undo
    in
        { model | dataModel = newDataModel, undo = newUndo }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

renameNode:
rename node select dans le Model.dataModel

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


renameNode : Model.Model -> Model.Model
renameNode model =
    let
        newName =
            model.input

        nId =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        newDataModel =
            DataModelActions.renameNode newName nId model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.RenameNode newName nId) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateSelectedFlux:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateSelectedFlux : String -> Model.Model -> Model.Model
updateSelectedFlux s model =
    let
        maybe_propId =
            LinkParameters.getPropertyIdFromName s model.dataModel.parameters

        newExportFlux =
            case maybe_propId of
                Nothing ->
                    model.exportFlux

                Just propId ->
                    Link.changeActiveProperty propId model.exportFlux
    in
        { model | exportFlux = newExportFlux }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exportLink:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


isIn_ : List Identifier -> Set Identifier -> Bool
isIn_ list set =
    case list of
        [] ->
            True

        x :: xs ->
            (Set.member x set) && (isIn_ xs set)


filterLinks_ : Set Identifier -> List Edge -> List Edge
filterLinks_ set list =
    -- on garde les edge tels que edge.parameters contient set
    List.filter (\x -> (isIn_ (Set.toList set) x.parameters)) list


exportLink : Model.Model -> Model.Model
exportLink model =
    let
        m1 =
            Model.defaultModel

        newEdges =
            -- [ { id = 11, source = 8, target = 10, parameters = Set.fromList [ 0, 1 ] } ]
            filterLinks_ model.exportFlux model.dataModel.edges

        dataModel =
            model.dataModel

        newDataModel =
            { dataModel | edges = newEdges }
    in
        { m1 | dataModel = newDataModel }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createParameter:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createParameter : Model.Model -> Model.Model
createParameter model =
    let
        newDataModel =
            (DataModelActions.createParameter model.input model.dataModel)

        newUndo =
            Scenario.addMsg (Scenario.CreateParameter model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteParameter:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


deleteParameter : Model.Model -> Model.Model
deleteParameter model =
    let
        newDataModel =
            DataModelActions.deleteParameter model.input model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.DeleteParameter model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createGroup:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createGroup : Model.Model -> Model.Model
createGroup model =
    let
        newDataModel =
            (DataModelActions.createGroup model.input model.dataModel)

        newUndo =
            Scenario.addMsg (Scenario.CreateGroup model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteGroup:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


deleteGroup : Model.Model -> Model.Model
deleteGroup model =
    let
        newDataModel =
            DataModelActions.deleteGroup model.input model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.DeleteGroup model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

createGeometry:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


createGeometry : Model.Model -> Model.Model
createGeometry model =
    let
        newDataModel =
            (DataModelActions.createGeometry model.input model.dataModel)

        newUndo =
            Scenario.addMsg (Scenario.CreateGeometry model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

deleteGeometry:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


deleteGeometry : Model.Model -> Model.Model
deleteGeometry model =
    let
        newDataModel =
            DataModelActions.deleteGeometry model.input model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.DeleteGeometry model.input) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }


updateNodeGeometryProperty : Node -> String -> Model.Model -> Model.Model
updateNodeGeometryProperty n s model =
    let
        newDataModel =
            DataModelActions.updateNodeGeometryProperty n s model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateNodeGeometryProperty n s) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateAttribute:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateAttribute : Model.Model -> String -> Model.Model
updateAttribute model s =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        newDataModel =
            DataModelActions.updateAttribute m_id s model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateAttribute s m_id) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateNodeType

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateNodeType : Model.Model -> ElementType -> Model.Model
updateNodeType model elemType =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        newDataModel =
            DataModelActions.updateNodeType m_id elemType model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateNodeType elemType m_id) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateNodeType

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateState : Model.Model -> ElementState -> Model.Model
updateState model elemState =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        newDataModel =
            DataModelActions.updateState m_id elemState model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateState elemState m_id) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateProperty:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateProperty : Edge -> String -> Model.Model -> Model.Model
updateProperty edge s model =
    let
        newDataModel =
            DataModelActions.updateProperty edge s model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateProperty edge s) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

dataModelToModel:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


dataModelToModel : String -> Model.Model -> Model.Model
dataModelToModel s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeDataModel s

        m1 =
            case res_elts of
                Ok elements ->
                    let
                        newDataModel =
                            DataModel.dataModelToModel elements model.dataModel

                        newUndo =
                            Scenario.addMsg (Scenario.LoadModel elements) model.undo
                    in
                        { model
                            | dataModel = newDataModel
                            , undo = newUndo
                        }

                Err _ ->
                    model
    in
        m1


undo : Model.Model -> Model.Model
undo model =
    let
        ( newModel, newUndo, r ) =
            case model.undo of
                x :: xs ->
                    ( Player.play (List.reverse xs) Model.defaultModel, xs, Just x )

                [] ->
                    ( model, [], Nothing )

        m1 =
            { newModel | undo = newUndo, redo = r }
    in
        m1


redo : Model.Model -> Model.Model
redo model =
    let
        newModel =
            Player.redo model.redo model

        newUndo =
            case model.redo of
                Just r ->
                    Scenario.addMsg r model.undo

                Nothing ->
                    model.undo
    in
        { newModel | redo = Nothing, undo = newUndo }


nodesInSelection : Model.Model -> List Node
nodesInSelection model =
    List.filter (\x -> (DataModel.isIdPresentInList x.id model.selection)) model.dataModel.nodes


groupNodes : Model.Model -> Model.Model
groupNodes model =
    let
        list =
            nodesInSelection model

        s =
            model.input

        newDataModel =
            DataModelActions.groupNodes list s model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.GroupNodes list s) model.undo
    in
        { model | dataModel = newDataModel, undo = newUndo }



{--
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

updateNodeGroupProperty:

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

--}


updateNodeGroupProperty : Node -> String -> Model.Model -> Model.Model
updateNodeGroupProperty n s model =
    let
        newDataModel =
            DataModelActions.updateNodeGroupProperty n s model.dataModel

        newUndo =
            Scenario.addMsg (Scenario.UpdateNodeGroupProperty n s) model.undo
    in
        { model
            | dataModel = newDataModel
            , undo = newUndo
        }


highLightGroup : String -> Model.Model -> Model.Model
highLightGroup s model =
    let
        newDataModel =
            DataModelActions.highLightGroup s model.dataModel
    in
        { model
            | dataModel =
                newDataModel
                -- , undo = newUndo
        }


highLightGeometry : String -> Model.Model -> Model.Model
highLightGeometry s model =
    let
        m_id =
            Geometries.getPropertyIdFromName s model.dataModel.geometries

        m1 =
            { model
                | geometryId =
                    case m_id of
                        Nothing ->
                            Nothing

                        Just x ->
                            case model.geometryId == m_id of
                                True ->
                                    Nothing

                                False ->
                                    m_id
            }
    in
        m1


selectedParameters : String -> Model.Model -> Model.Model
selectedParameters s model =
    let
        newDataModel =
            DataModelActions.selectedParameters s model.dataModel
    in
        { model
            | dataModel =
                newDataModel
                -- , undo = newUndo
        }


updateLightNodesPosition : Model.Model -> Model.Model
updateLightNodesPosition model =
    let
        m_lay =
            model.dataModel.lightLayout

        newModel =
            case m_lay of
                Nothing ->
                    model

                Just lay ->
                    let
                        newDataModel =
                            DataModelActions.updateNodesPosition lay model.dataModel
                    in
                        { model
                            | dataModel =
                                newDataModel
                        }
    in
        newModel


updateGeometryNodesPosition : Model.Model -> Model.Model
updateGeometryNodesPosition model =
    let
        m_l =
            case model.geometryId of
                Nothing ->
                    Nothing

                Just id ->
                    DataModel.getGeometryLayoutFromId id model.dataModel

        newModel =
            case m_l of
                Nothing ->
                    model

                Just lay ->
                    -- model
                    let
                        newDataModel =
                            DataModelActions.updateNodesPosition lay model.dataModel
                    in
                        { model
                            | dataModel =
                                newDataModel
                        }
    in
        newModel


updateNodesPosition : Model.Model -> Model.Model
updateNodesPosition model =
    case model.viewType of
        Model.ALL ->
            updateLightNodesPosition model

        Model.ALL_LIGHT ->
            updateLightNodesPosition model

        Model.BULL ->
            updateBullNodesPosition model

        Model.GEOMETRY ->
            updateGeometryNodesPosition model

        _ ->
            model


updateBullNodesPosition : Model.Model -> Model.Model
updateBullNodesPosition model =
    let
        m_l =
            case model.nodeViewId of
                Nothing ->
                    model.dataModel.rootBubbleLayout

                Just id ->
                    DataModel.getLayoutFromNodeId id model.dataModel

        newModel =
            case m_l of
                Nothing ->
                    model

                Just lay ->
                    -- model
                    let
                        newDataModel =
                            DataModelActions.updateNodesPosition lay model.dataModel
                    in
                        { model
                            | dataModel =
                                newDataModel
                        }
    in
        newModel


updateTightness : Model.Model -> Model.Model
updateTightness model =
    let
        newModel =
            case model.selection of
                x :: xs ->
                    let
                        newDataModel =
                            DataModelActions.updateTightnessForGroup model.input x model.dataModel

                        newUndo =
                            Scenario.addMsg (Scenario.UpdateTightnessForGroup model.input x) model.undo
                    in
                        { model
                            | dataModel =
                                newDataModel
                            , undo = newUndo
                        }

                [] ->
                    model
    in
        newModel


updateLayoutFromNodeId : String -> Model -> Model
updateLayoutFromNodeId s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeNodesPosition s

        newModel =
            case res_elts of
                Ok elements ->
                    let
                        newDataModel =
                            DataModelActions.updateLayoutFromNodeId model.nodeViewId elements model.dataModel

                        newUndo =
                            Scenario.addMsg (Scenario.UpdateLayoutFromNodeId model.nodeViewId elements) model.undo
                    in
                        { model
                            | dataModel =
                                newDataModel
                            , undo = newUndo
                        }

                _ ->
                    model
    in
        newModel


updateGeometryLayout : String -> Model -> Model
updateGeometryLayout s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeNodesPosition s

        newModel =
            case res_elts of
                Ok elements ->
                    let
                        newDataModel =
                            DataModelActions.updateGeometryLayoutFromId model.geometryId elements model.dataModel

                        -- newUndo =
                        --     Scenario.addMsg (Scenario.UpdateLayoutFromNodeId model.nodeViewId elements) model.undo
                    in
                        { model
                            | dataModel =
                                newDataModel
                                -- , undo = newUndo
                        }

                _ ->
                    model
    in
        newModel


updateLightLayout : String -> Model -> Model
updateLightLayout s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeNodesPosition s

        newModel =
            case res_elts of
                Ok elements ->
                    let
                        newDataModel =
                            DataModelActions.updateLightLayout elements model.dataModel

                        newUndo =
                            Scenario.addMsg (Scenario.UpdateLightLayout elements) model.undo
                    in
                        { model
                            | dataModel =
                                newDataModel
                            , undo = newUndo
                        }

                _ ->
                    model
    in
        newModel


triNodes : Model -> Model
triNodes model =
    let
        newDataModel =
            DataModel.triNodes model.dataModel
    in
        { model | dataModel = newDataModel }


getNodeViewLabel : Model -> String
getNodeViewLabel model =
    let
        s =
            getAscendantName model

        sId =
            case model.nodeViewId of
                Nothing ->
                    " ( )"

                Just i ->
                    " ( id = " ++ toString (i) ++ " )"
    in
        s ++ sId


getCounterViewLabel : Model -> String
getCounterViewLabel model =
    "Blocks " ++ toString (List.length model.dataModel.nodes) ++ " / Links " ++ toString (List.length model.dataModel.edges)


getAscendantName : Model -> String
getAscendantName model =
    let
        s =
            case model.nodeViewId of
                Nothing ->
                    "Root"

                Just id ->
                    let
                        m_n =
                            DataModel.getNodeFromId id model.dataModel.nodes

                        s2 =
                            case m_n of
                                Nothing ->
                                    "Nothing"

                                Just n ->
                                    DataModelActions.getAscendantName n model.dataModel
                    in
                        s2
    in
        s


searchElement : Model -> Model
searchElement model =
    let
        newSearchModel =
            Search.search model.searchModel model.input model.dataModel.nodes

        m1 =
            case List.head newSearchModel.nodes of
                Nothing ->
                    { model
                        | nodeViewId = Nothing
                        , selection = []
                        , searchModel = newSearchModel
                    }

                Just n ->
                    { model
                        | nodeViewId = Just n.id
                        , selection = [ n.id ]
                        , searchModel = newSearchModel
                    }
    in
        m1


insertKey : KeyCode -> Model -> Model
insertKey k model =
    let
        newSpecialKey =
            SpecialKey.insert k model.specialKey
    in
        { model | specialKey = newSpecialKey }


removeKey : KeyCode -> Model -> Model
removeKey k model =
    let
        newSpecialKey =
            SpecialKey.remove k model.specialKey
    in
        { model | specialKey = newSpecialKey }


mask : Model -> Model
mask model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        m1 =
            case m_s of
                Nothing ->
                    model

                Just id ->
                    case DataModelActions.isMasked id model.dataModel of
                        True ->
                            removeMask model

                        False ->
                            insertMask model
    in
        m1


insertMask : Model -> Model
insertMask model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        m1 =
            case m_s of
                Nothing ->
                    model

                Just id ->
                    let
                        newDataModel =
                            DataModelActions.insertMask id model.dataModel
                    in
                        { model | dataModel = newDataModel }
    in
        m1


removeMask : Model -> Model
removeMask model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        m1 =
            case m_s of
                Nothing ->
                    model

                Just id ->
                    let
                        newDataModel =
                            DataModelActions.removeMask id model.dataModel
                    in
                        { model | dataModel = newDataModel }
    in
        m1


ctrlC : Model -> Model
ctrlC model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        b =
            SpecialKey.member 17 model.specialKey

        m1 =
            case ( m_s, b ) of
                ( Just id, True ) ->
                    let
                        newModel =
                            Player.doCtrlC id model

                        newUndo =
                            Scenario.addMsg (Scenario.CtrlC id) model.undo
                    in
                        { newModel
                            | undo = newUndo
                        }

                _ ->
                    model
    in
        m1


ctrlX : Model -> Model
ctrlX model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        b =
            SpecialKey.member 17 model.specialKey

        m1 =
            case ( m_s, b ) of
                ( Just id, True ) ->
                    let
                        newModel =
                            Player.doCtrlX id model

                        newUndo =
                            Scenario.addMsg (Scenario.CtrlX id) model.undo
                    in
                        { newModel
                            | undo = newUndo
                        }

                _ ->
                    model
    in
        m1


ctrlV : Model -> Model
ctrlV model =
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        b =
            SpecialKey.member 17 model.specialKey

        m1 =
            case b of
                True ->
                    let
                        newModel =
                            Player.doCtrlV m_s model

                        newUndo =
                            Scenario.addMsg (Scenario.CtrlV m_s) model.undo
                    in
                        { newModel
                            | undo = newUndo
                        }

                _ ->
                    model
    in
        m1


dataImportModelToModel : String -> Model.Model -> Model.Model
dataImportModelToModel s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeDataModel s

        m1 =
            case res_elts of
                Ok elements ->
                    let
                        newDataModel0 =
                            DataModel.dataModelToModel elements model.dataModel

                        newDataModel =
                            DataModel.getNodeIdentifier newDataModel0

                        newId =
                            newDataModel.curNodeId

                        -- newUndo =
                        --     Scenario.addMsg (Scenario.ImportModel elements) model.undo
                    in
                        { model
                            | tmpDataModel =
                                { m_id = Just newId, data = newDataModel }
                                -- , undo = newUndo
                        }

                Err _ ->
                    model
    in
        m1


dataImportCsvModelToModel : String -> Model.Model -> Model.Model
dataImportCsvModelToModel s model =
    let
        newDataModel0 =
            Csv.loadCsvModel s model.dataModel

        newDataModel =
            DataModel.getNodeIdentifier newDataModel0

        newId =
            newDataModel.curNodeId

        -- newUndo =
        --     Scenario.addMsg (Scenario.ImportCsvModel s) model.undo
    in
        { model
            | tmpDataModel =
                { m_id = Just newId, data = newDataModel }
                -- , undo = newUndo
        }


sendGeometryName : String -> Model.Model -> Model.Model
sendGeometryName s model =
    let
        res_elts =
            Json.Decode.decodeString DataModelDecoders.decodeGeometryProperty s

        m1 =
            case res_elts of
                Ok element ->
                    let
                        newDataModel =
                            DataModelActions.sendGeometryName element model.dataModel

                        newUndo =
                            Scenario.addMsg (Scenario.SendGeometryName element) model.undo
                    in
                        { model
                            | dataModel =
                                newDataModel
                            , undo = newUndo
                        }

                _ ->
                    model
    in
        m1


loadCsvModel : String -> Model.Model -> Model.Model
loadCsvModel s model =
    let
        newDataModel =
            Csv.loadCsvModel s DataModel.defaultModel

        --model.dataModel
        newUndo =
            Scenario.addMsg (Scenario.LoadCsvModel s) model.undo
    in
        { model
            | dataModel =
                newDataModel
            , undo = newUndo
        }


blow : Model.Model -> Model.Model
blow model =
    -- activation/desactivation du champ blow pour le bloc selectionné
    let
        m_s =
            Selection.getFirstSelectionIdentifier model.selection

        newDataModel =
            case m_s of
                Just id ->
                    (DataModelActions.blow id model.dataModel)

                _ ->
                    model.dataModel
    in
        { model | dataModel = newDataModel }
