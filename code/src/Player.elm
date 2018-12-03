module Player exposing (play, redo, doCtrlX, doCtrlV, doCtrlC)

import Scenario exposing (Msg(..))
import Model
import PlayerDataModel
import Identifier exposing (Identifier)
import DataModelActions
import DataModel
import ModelManagement
import Verification


isDataMsg : Msg -> Bool
isDataMsg msg =
    case msg of
        CtrlC _ ->
            True

        CtrlV _ ->
            True

        CtrlX _ ->
            True

        _ ->
            False


playOne : Msg -> Model.Model -> Model.Model
playOne msg model =
    let
        newModel =
            case (isDataMsg msg) of
                False ->
                    let
                        newDataModel =
                            PlayerDataModel.playOne msg model.dataModel
                    in
                        { model | dataModel = newDataModel }

                True ->
                    case msg of
                        CtrlC id ->
                            doCtrlC id model

                        CtrlX id ->
                            doCtrlX id model

                        CtrlV m_id ->
                            doCtrlV m_id model

                        _ ->
                            model
    in
        newModel


play : Scenario.Model -> Model.Model -> Model.Model
play list model =
    case list of
        x :: xs ->
            play xs (playOne x model)

        [] ->
            model


redo : Scenario.RedoModel -> Model.Model -> Model.Model
redo m_redo model =
    case m_redo of
        Just x ->
            playOne x model

        Nothing ->
            model


saveNodeToTmp_ : Identifier -> Model.Model -> Model.Model
saveNodeToTmp_ id model =
    let
        m_n =
            DataModel.getNodeFromId id model.dataModel.nodes

        m1 =
            case m_n of
                Nothing ->
                    model

                Just n ->
                    let
                        newNodes =
                            ModelManagement.getDescendantsFromN model.dataModel.nodes n

                        newEdges =
                            List.filter
                                (\x ->
                                    DataModel.isNodeIdPresent x.source newNodes
                                        || DataModel.isNodeIdPresent x.target newNodes
                                )
                                model.dataModel.edges

                        defModel =
                            DataModel.defaultModel

                        newData =
                            { defModel | nodes = newNodes, edges = newEdges }

                        newTmpModel =
                            { m_id = Just id
                            , data = newData
                            }
                    in
                        { model | tmpDataModel = newTmpModel }
    in
        m1


doCtrlX : Identifier -> Model.Model -> Model.Model
doCtrlX id model =
    let
        m1 =
            saveNodeToTmp_ id model

        newDataModel =
            DataModelActions.deleteNode id m1.dataModel
    in
        { m1 | dataModel = newDataModel }


doCtrlV : Maybe Identifier -> Model.Model -> Model.Model
doCtrlV m_s model =
    let
        m_id =
            model.tmpDataModel.m_id

        newDataModel =
            DataModelActions.insertFromTmp m_s m_id model.tmpDataModel.data model.dataModel

        dm1 =
            Verification.verification newDataModel
    in
        { model | dataModel = dm1 }


doCtrlC : Identifier -> Model.Model -> Model.Model
doCtrlC id model =
    saveNodeToTmp_ id model
