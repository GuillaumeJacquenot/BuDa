module Actions
    exposing
        ( deleteElement
        , showAllData
        , showBulles
        , showPBS
        , showView
        , upView
        , update
        )

import DataModel
import DataModelEncoders
import Dom exposing (focus)
import Export
import Geometries
import LayoutMenuActions
import LinkToJS
import Messages exposing (Msg(..))
import Model
import ModelActions
import ModelViews
import Mqtt
import Notification
import Notifications
import NotificationActions
import Search
import Selection
import SpecialKey
import Task
import Verification


upView : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
upView msg model =
    let
        maybe_parent =
            DataModel.getParentFromNodeId model.nodeViewId model.dataModel.nodes

        m0 =
            { model | nodeViewId = maybe_parent }
    in
        showView msg m0


showView : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showView msg model =
    let
        ( m1, cmd ) =
            case model.viewType of
                Model.ALL ->
                    showAllData msg model

                Model.PBS ->
                    showPBS msg model

                Model.BULL ->
                    showBulles msg model

                Model.ALL_LIGHT ->
                    showAllDataLight msg model

                Model.GEOMETRY ->
                    showGeometry msg model

        m2 =
            { m1 | selection = [], selectionType = Model.PARENT }

        cmd1 =
            case model.selectionType of
                Model.PARENT ->
                    -- on renvoie le pere vers JS pour creer tous les fils
                    LinkToJS.sendParentSelection (DataModelEncoders.encodeMaybeIdentifier (Selection.getFirstSelectionIdentifier model.selection))

                Model.LINK m_id ->
                    -- on renvoie id du lien
                    LinkToJS.sendParentSelection (DataModelEncoders.encodeMaybeIdentifier m_id)

        cmds_list =
            [ cmd, cmd1 ]

        cl1 =
            processFocus msg cmds_list

        -- [ (Task.attempt FocusResult (Dom.focus "input")) ]
    in
        ( m2
        , Cmd.batch cl1
        )


showAllData : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showAllData msg model =
    ( model
    , LinkToJS.sendDataAllModel (DataModelEncoders.encodeModel (ModelViews.showAllData model).dataModel)
    )


showAllDataLight : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showAllDataLight msg model =
    ( model
    , LinkToJS.sendDataFlatModel (DataModelEncoders.encodeModel (ModelViews.showAllDataLight model).dataModel)
    )


showPBS : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showPBS msg model =
    ( model
    , LinkToJS.sendDataPBSModel (DataModelEncoders.encodeModel (ModelViews.showPBS model))
    )


showBulles : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showBulles msg model =
    let
        m1 =
            ModelViews.showAllDataLight (ModelViews.showBulles model)
    in
        ( model
        , LinkToJS.sendDataBullesModel (DataModelEncoders.encodeModel m1.dataModel)
        )


showGeometry : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
showGeometry msg model =
    ( model
    , LinkToJS.sendDataGeometryModel (DataModelEncoders.encodeModel (ModelViews.showGeometry model).dataModel)
    )


deleteElement : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
deleteElement msg model =
    let
        b =
            --shift
            SpecialKey.member 16 model.specialKey

        m1 =
            case ( model.selection, b ) of
                ( x :: xs, True ) ->
                    case DataModel.isNodeIdPresent x model.dataModel.nodes of
                        True ->
                            ModelActions.deleteNode x model

                        False ->
                            ModelActions.deleteEdge x model

                _ ->
                    model

        ( m2, cmd ) =
            showView msg m1
    in
        prepareNotification_ cmd m2


sendNotification : String -> Model.Model -> Notification.NotificationData -> Cmd Msg
sendNotification s model notifyData =
    let
        model_mqtt =
            model.mqtt

        newMqtt =
            { model_mqtt | topic = "architecture." ++ s }

        m1 =
            { model | mqtt = newMqtt }
    in
        LinkToJS.mqttToJS
            { tag = "MqttNotify", data = DataModelEncoders.encodeMqttMessageNotification_ m1.mqtt (Notification.notification s notifyData) }


askForMessages : Model.Model -> ( Model.Model, Cmd Msg )
askForMessages model =
    let
        z =
            "Call askForMessages"
    in
        ( model, Cmd.none )


processFocus : Msg -> List (Cmd Msg) -> List (Cmd Msg)
processFocus msg list =
    let
        taskFocus =
            Task.attempt FocusResult (Dom.focus "input")
    in
        case msg of
            KeyUps s ->
                case s of
                    86 ->
                        -- v
                        list

                    88 ->
                        -- x
                        list

                    _ ->
                        List.concat [ list, [ taskFocus ] ]

            _ ->
                List.concat [ list, [ taskFocus ] ]


prepareNotifications_ : List (Cmd Msg) -> Notifications.Model -> Model.Model -> List (Cmd Msg)
prepareNotifications_ cmds notifications model =
    case notifications of
        [] ->
            cmds

        x :: xs ->
            let
                notification =
                    { x | header = model.mqtt.clientId ++ "." ++ x.header }

                newCmds =
                    (sendNotification notification.header model notification.data) :: cmds
            in
                prepareNotifications_ newCmds xs model


prepareNotification_ : Cmd Msg -> Model.Model -> ( Model.Model, Cmd Msg )
prepareNotification_ cmd model =
    let
        cmds =
            prepareNotifications_ [ cmd ] model.dataModel.notifications model

        dataModel =
            model.dataModel

        newDataModel =
            { dataModel | notifications = [] }

        m1 =
            { model | dataModel = newDataModel }
    in
        ( m1, Cmd.batch cmds )


update : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
update msg model =
    let
        searchBuildList =
            (Search.mustBuildList model.searchModel True)

        m1 =
            case msg of
                FocusOn _ ->
                    model

                FocusResult _ ->
                    model

                CreateNode ->
                    { model | searchModel = searchBuildList }

                RenameNode ->
                    { model | searchModel = searchBuildList }

                CreateLink ->
                    model

                InputChange _ ->
                    -- on modifie le texte pour la recherche
                    { model | searchModel = searchBuildList }

                InputFileChange _ ->
                    model

                Selection _ ->
                    model

                ModelToElm _ ->
                    -- nouveau model depuis javascript
                    { model | searchModel = searchBuildList }

                CsvModelToElm _ ->
                    -- nouveau csv model depuis javascript
                    { model | searchModel = searchBuildList }

                ImportModelToElm _ ->
                    -- import nouveau model depuis javascript
                    { model | searchModel = searchBuildList }

                ImportCsvModeltoElm _ ->
                    -- import nouveau csv model depuis javascript
                    { model | searchModel = searchBuildList }

                NodesPositionToElm _ ->
                    model

                SaveModel ->
                    model

                LoadModel ->
                    model

                SwitchToView _ ->
                    model

                KeyUps s ->
                    case s of
                        46 ->
                            { model | searchModel = searchBuildList }

                        _ ->
                            model

                KeyDowns _ ->
                    model

                DoubleClick _ ->
                    model

                CheckProperty _ _ ->
                    model

                CheckFlux _ ->
                    model

                ExportLink ->
                    model

                CreateParameter ->
                    model

                DeleteParameter ->
                    model

                UpdateAttribute _ ->
                    model

                GroupNodes ->
                    -- creation du bloc groupe
                    { model | searchModel = searchBuildList }

                CheckNodeGroupProperty _ _ ->
                    model

                CreateGroup ->
                    model

                DeleteGroup ->
                    model

                HighLightGroup _ ->
                    model

                SelectedParameters _ ->
                    model

                UpdateTightness ->
                    model

                Layout ->
                    model

                GetPositions ->
                    model

                Undo ->
                    -- undo
                    { model | searchModel = searchBuildList }

                Redo ->
                    -- redo
                    { model | searchModel = searchBuildList }

                NodesPositionRequest _ ->
                    model

                OnOpen ->
                    model

                OnImport ->
                    model

                ImportModel ->
                    -- envoie message importModel vers javascript
                    model

                AskForMessages ->
                    model

                NewMessage _ ->
                    model

                SaveToImage ->
                    model

                CreateGeometry ->
                    model

                DeleteGeometry ->
                    model

                CheckNodeGeometryProperty _ _ ->
                    model

                HighLightGeometry _ ->
                    model

                LoadGeometry ->
                    model

                LoadGeometryButton _ ->
                    model

                SendGeometryToElm _ ->
                    model

                SwitchToLayout _ ->
                    model

                ShowHideFunctionalChain ->
                    model

                ShowHideGeometries ->
                    model

                ShowHideParameters ->
                    model

                Verification ->
                    model

                OnNotificationClick ->
                    model

                UserChange _ ->
                    model

                UrlChange _ ->
                    model

                MqttConnect ->
                    model

                MqttDisconnect ->
                    model

                NoOp ->
                    model
    in
        globalUpdate msg m1


globalUpdate : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
globalUpdate msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        Undo ->
            -- ( ModelActions.undo model, Cmd.none )
            showView msg (ModelActions.undo model)

        Redo ->
            showView msg (ModelActions.redo model)

        Layout ->
            ( model, LinkToJS.layout "" )

        GetPositions ->
            ( model, LinkToJS.requestpositions "" )

        NodesPositionRequest s ->
            ( model
            , case model.viewType of
                Model.ALL_LIGHT ->
                    LinkToJS.requestpositions ""

                Model.BULL ->
                    LinkToJS.requestpositions ""

                _ ->
                    Cmd.none
            )

        UpdateTightness ->
            showView msg (ModelActions.updateTightness model)

        HighLightGroup s ->
            showView msg (ModelActions.highLightGroup s model)

        SelectedParameters s ->
            showView msg (ModelActions.selectedParameters s model)

        GroupNodes ->
            showView msg (ModelActions.groupNodes model)

        UpdateAttribute s ->
            ( ModelActions.updateAttribute model s, Cmd.none )

        FocusOn id ->
            model ! [ Task.attempt FocusResult (focus id) ]

        FocusResult result ->
            case result of
                Err (Dom.NotFound id) ->
                    { model | error = Just ("Could not find dom id: " ++ id) } ! []

                Ok () ->
                    { model | error = Nothing } ! []

        CreateParameter ->
            ( ModelActions.createParameter model, Cmd.none )

        DeleteParameter ->
            ( ModelActions.deleteParameter model, Cmd.none )

        SaveToImage ->
            let
                imgName =
                    case (String.isEmpty model.inputFile) of
                        True ->
                            "graph"

                        False ->
                            model.inputFile
            in
                ( model, Cmd.batch [ LinkToJS.saveToImage imgName ] )

        ExportLink ->
            let
                saveName =
                    case (String.isEmpty model.inputFile) of
                        True ->
                            "export"

                        False ->
                            model.inputFile

                expNodes =
                    DataModelEncoders.encodeExport { filename = saveName ++ "Nodes.txt", model = (Export.encodeNodes model.dataModel) }

                expEdges =
                    DataModelEncoders.encodeExport { filename = saveName ++ "Links.csv", model = (Export.encodeLinks model.dataModel) }
            in
                ( model, Cmd.batch [ LinkToJS.exportLNK (expNodes), LinkToJS.exportLNK (expEdges) ] )

        CheckFlux s ->
            ( ModelActions.updateSelectedFlux s model, Cmd.none )

        CheckProperty edge s ->
            ( ModelActions.updateProperty edge s model, Cmd.none )

        CheckNodeGroupProperty node s ->
            ( ModelActions.updateNodeGroupProperty node s model, Cmd.none )

        CreateGroup ->
            ( ModelActions.createGroup model, Cmd.none )

        DeleteGroup ->
            let
                m1 =
                    ModelActions.deleteGroup model
            in
                showView msg m1

        CreateGeometry ->
            ( ModelActions.createGeometry model, Cmd.none )

        DeleteGeometry ->
            ( ModelActions.deleteGeometry model, Cmd.none )

        CheckNodeGeometryProperty node s ->
            ( ModelActions.updateNodeGeometryProperty node s model, Cmd.none )

        HighLightGeometry s ->
            showView msg (ModelActions.highLightGeometry s model)

        LoadGeometry ->
            ( model
            , LinkToJS.loadGeometryRequest
                (case model.selectedGeometryId of
                    Nothing ->
                        []

                    Just i ->
                        [ i ]
                )
            )

        LoadGeometryButton s ->
            let
                m_geometry =
                    Geometries.getPropertyIdFromName s model.dataModel.geometries
            in
                ( { model | selectedGeometryId = m_geometry }, LinkToJS.loadGeometryButton s )

        SendGeometryToElm s ->
            ( ModelActions.sendGeometryName s model, Cmd.none )

        SwitchToView s ->
            let
                m1 =
                    { model | viewType = s }
            in
                showView msg m1

        SwitchToLayout s ->
            let
                newLayoutMenu =
                    LayoutMenuActions.layoutPicked s model.layoutMenu

                m1 =
                    { model | layoutMenu = newLayoutMenu }
            in
                -- showView msg m1
                ( m1, Cmd.batch [ (LinkToJS.setLayoutNameThenLayout s) ] )

        CreateNode ->
            let
                m1 =
                    ModelActions.createNode model

                ( m2, cmd ) =
                    showView msg m1
            in
                prepareNotification_ cmd m2 "node" "create"

        RenameNode ->
            let
                m1 =
                    ModelActions.renameNode model

                ( m2, cmd ) =
                    showView msg m1
            in
                prepareNotification_ cmd m2 "node" "rename"

        CreateLink ->
            case model.selection of
                x1 :: x2 :: [] ->
                    let
                        m1 =
                            ModelActions.createLink x1 x2 model

                        ( m2, cmd ) =
                            showView msg m1
                    in
                        prepareNotification_ cmd m2 "edge" "create"

                _ ->
                    ( model, Cmd.none )

        InputChange s ->
            ( { model | input = s }, Cmd.none )

        InputFileChange s ->
            ( { model | inputFile = s }, Cmd.none )

        Selection s ->
            let
                x =
                    Selection.decodeFromJSMsg (s)

                newSelection =
                    Selection.updateModelSelection model.selection x

                m1 =
                    { model | selection = newSelection }
            in
                ( m1, Cmd.none )

        ModelToElm s ->
            {--
        Appel apres chargement modele dans le js.
        ModelToElm permet de mettre a jour Model.Model avec le modele js
        --}
            let
                m1 =
                    ModelActions.dataModelToModel s model
            in
                showView msg m1

        CsvModelToElm s ->
            let
                m1 =
                    ModelActions.loadCsvModel s model
            in
                showView msg m1

        ImportModelToElm s ->
            let
                m1 =
                    ModelActions.dataImportModelToModel s model
            in
                ( m1, Cmd.none )

        ImportCsvModeltoElm s ->
            let
                m1 =
                    ModelActions.dataImportCsvModelToModel s model
            in
                ( m1, Cmd.none )

        NodesPositionToElm s ->
            let
                m1 =
                    case model.viewType of
                        Model.ALL_LIGHT ->
                            ModelActions.updateLightLayout s model

                        Model.GEOMETRY ->
                            ModelActions.updateGeometryLayout s model

                        _ ->
                            ModelActions.updateLayoutFromNodeId s model
            in
                ( m1, Cmd.none )

        SaveModel ->
            let
                saveName =
                    case (String.isEmpty model.inputFile) of
                        True ->
                            "model.json"

                        False ->
                            model.inputFile
            in
                ( model, LinkToJS.saveModel (DataModelEncoders.encodeMetaModel { filename = saveName, model = model.dataModel }) )

        LoadModel ->
            ( model, LinkToJS.loadModel model.loadModelId )

        KeyDowns k ->
            case k of
                16 ->
                    ( ModelActions.insertKey k model, Cmd.none )

                17 ->
                    ( ModelActions.insertKey k model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        KeyUps k ->
            case k of
                16 ->
                    ( ModelActions.removeKey k model, Cmd.none )

                17 ->
                    ( ModelActions.removeKey k model, Cmd.none )

                38 ->
                    upView msg model

                45 ->
                    showView msg (ModelActions.mask model)

                46 ->
                    deleteElement msg model

                67 ->
                    -- key c
                    ( ModelActions.ctrlC model, Cmd.none )

                86 ->
                    -- key v
                    showView msg (ModelActions.ctrlV model)

                88 ->
                    -- key x
                    showView msg (ModelActions.ctrlX model)

                112 ->
                    -- F1
                    showView msg (ModelActions.searchElement model)

                113 ->
                    -- F2
                    showView msg (ModelActions.blow model)

                _ ->
                    ( model, Cmd.none )

        DoubleClick s ->
            let
                element =
                    Selection.decodeFromJSId s

                newNodeViewId =
                    case element.err of
                        True ->
                            Nothing

                        False ->
                            Just element.id

                m1 =
                    { model | nodeViewId = newNodeViewId }
            in
                showView msg m1

        OnOpen ->
            ( model, LinkToJS.onOpen "" )

        OnImport ->
            ( model, LinkToJS.onImport "" )

        AskForMessages ->
            askForMessages model

        NewMessage str ->
            let
                newNotifications =
                    NotificationActions.updateNotificationModel str model.dataModel.receivedNotifications

                model_dataModel =
                    model.dataModel

                newDataModel =
                    { model_dataModel | receivedNotifications = newNotifications }

                m1 =
                    { model | dataModel = newDataModel }

                z =
                    Debug.log "Notifications: " (List.length m1.dataModel.receivedNotifications)
            in
                ( m1, Cmd.none )

        OnNotificationClick ->
            let
                model_dataModel =
                    model.dataModel

                newDataModel =
                    { model_dataModel | receivedNotifications = [] }

                m1 =
                    { model | dataModel = newDataModel }

                z =
                    Debug.log "Notifications: " (List.length m1.dataModel.receivedNotifications)
            in
                ( m1, Cmd.none )

        ImportModel ->
            ( model, LinkToJS.importModel "importModel" )

        ShowHideFunctionalChain ->
            ( { model | showFunctionalChain = not model.showFunctionalChain }, Cmd.none )

        ShowHideGeometries ->
            ( { model | showGeometries = not model.showGeometries }, Cmd.none )

        ShowHideParameters ->
            ( { model | showParameters = not model.showParameters }, Cmd.none )

        Verification ->
            let
                dm =
                    Verification.verificationBlocs model.dataModel

                dm2 =
                    Verification.verification dm

                m1 =
                    { model | dataModel = dm2 }
            in
                ( m1, Cmd.none )

        UserChange s ->
            ( { model | mqtt = Mqtt.setClientId s model.mqtt }, Cmd.none )

        UrlChange s ->
            ( { model | mqtt = Mqtt.setUrl s model.mqtt }, Cmd.none )

        MqttConnect ->
            ( model, Cmd.batch [ LinkToJS.mqttConnect (DataModelEncoders.encodeMqttMessage model.mqtt Notification.NULLNOTIFICATION) ] )

        MqttDisconnect ->
            ( model, Cmd.batch [ LinkToJS.mqttDisconnect "" ] )
