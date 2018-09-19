module PlayerDataModel exposing (play, playOne, redo)

import DataModel
import Scenario exposing (Msg(..))
import DataModelActions
import Csv


playOne : Msg -> DataModel.Model -> DataModel.Model
playOne msg model =
    let
        newModel =
            case msg of
                CreateNode s m_id ->
                    DataModelActions.createNode s m_id model

                CreateLink ids idt ->
                    DataModelActions.createLink ids idt model

                DeleteLink id ->
                    DataModelActions.deleteEdge id model

                DeleteNode id ->
                    DataModelActions.deleteNode id model

                RenameNode s m_id ->
                    DataModelActions.renameNode s m_id model

                CreateParameter s ->
                    DataModelActions.createParameter s model

                DeleteParameter s ->
                    DataModelActions.deleteParameter s model

                UpdateProperty edge s ->
                    DataModelActions.updateProperty edge s model

                UpdateAttribute s m_id ->
                    DataModelActions.updateAttribute m_id s model

                UpdateNodeRoles networkId role m_id ->
                    DataModelActions.updateNodeRoles m_id networkId role model

                UpdateState state m_id ->
                    DataModelActions.updateState m_id state model

                LoadModel elements ->
                    DataModel.dataModelToModel elements model

                GroupNodes list s ->
                    DataModelActions.groupNodes list s model

                CreateGroup s ->
                    DataModelActions.createGroup s model

                DeleteGroup s ->
                    DataModelActions.deleteGroup s model

                CreateGeometry s ->
                    DataModelActions.createGeometry s model

                DeleteGeometry s ->
                    DataModelActions.deleteGeometry s model

                UpdateNodeGeometryProperty n s ->
                    DataModelActions.updateNodeGeometryProperty n s model

                UpdateNodeGroupProperty n s ->
                    DataModelActions.updateNodeGroupProperty n s model

                UpdateTightnessForGroup s edgeId ->
                    DataModelActions.updateTightnessForGroup s edgeId model

                UpdateLayoutFromNodeId m_id list ->
                    DataModelActions.updateLayoutFromNodeId m_id list model

                UpdateLightLayout layout ->
                    DataModelActions.updateLightLayout layout model

                SendGeometryName element ->
                    DataModelActions.sendGeometryName element model

                LoadCsvModel s ->
                    Csv.loadCsvModel s model

                _ ->
                    model
    in
        newModel


play : Scenario.Model -> DataModel.Model -> DataModel.Model
play list model =
    case list of
        x :: xs ->
            play xs (playOne x model)

        [] ->
            model


redo : Scenario.RedoModel -> DataModel.Model -> DataModel.Model
redo m_redo model =
    case m_redo of
        Just x ->
            playOne x model

        Nothing ->
            model
