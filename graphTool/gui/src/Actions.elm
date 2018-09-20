module Actions exposing (update)

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
import Board
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
                Model.All ->
                    displayAll model

                Model.Pbs ->
                    displayPbs model

                Model.Bubble ->
                    displayBubble model

                Model.Flat ->
                    displayFlat model

                Model.Geometry ->
                    displayGeometry model

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


displayAll : Model.Model -> ( Model.Model, Cmd Msg )
displayAll model =
    ( model, Board.displayAll model )


displayFlat : Model.Model -> ( Model.Model, Cmd Msg )
displayFlat model =
    ( model, Board.displayFlat model )


displayPbs : Model.Model -> ( Model.Model, Cmd Msg )
displayPbs model =
    ( model, Board.displayPbs model )


displayBubble : Model.Model -> ( Model.Model, Cmd Msg )
displayBubble model =
    ( model, Board.displayBubble model )


displayGeometry : Model.Model -> ( Model.Model, Cmd Msg )
displayGeometry model =
    ( model, Board.displayGeometry model )


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
    in
        showView msg m1


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


initModelHighlights : Model.Model -> Model.Model
initModelHighlights model =
    let
        dataModel =
            model.dataModel

        initNodes =
            List.map (\x -> { x | highLighted = 0 }) dataModel.nodes

        initEdges =
            List.map (\x -> { x | highLighted = 0 }) dataModel.edges

        dm1 =
            { dataModel | nodes = initNodes, edges = initEdges }
    in
        { model | dataModel = dm1, propagationDone = False }


update : Msg -> Model.Model -> ( Model.Model, Cmd Msg )
update msg model =
    let
        searchBuildList =
            Search.mustBuildList model.searchModel True

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

                Csv2ModelToElm _ ->
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

                SwitchElemRole _ _ ->
                    model

                SwitchElemState _ ->
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

                Propagation ->
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
                Model.Flat ->
                    LinkToJS.requestpositions ""

                Model.Bubble ->
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
                    case String.isEmpty model.inputFile of
                        True ->
                            "graph"

                        False ->
                            model.inputFile
            in
                ( model, Cmd.batch [ LinkToJS.saveToImage imgName ] )

        ExportLink ->
            let
                saveName : String
                saveName =
                    case String.isEmpty model.inputFile of
                        True ->
                            "export"

                        False ->
                            model.inputFile

                expNodes : String
                expNodes =
                    DataModelEncoders.encodeExport { filename = saveName ++ "Nodes.txt", model = Export.encodeNodes model.dataModel }

                expEdges : String
                expEdges =
                    DataModelEncoders.encodeExport { filename = saveName ++ "Links.csv", model = Export.encodeLinks model.dataModel }

                expPropagationOnNodes : String
                expPropagationOnNodes =
                    DataModelEncoders.encodeExport { filename = saveName ++ "Propagation.csv", model = Export.encodePropagation model.dataModel }
            in
                ( model, Cmd.batch [ LinkToJS.exportLNK expNodes, LinkToJS.exportLNK expEdges, LinkToJS.exportLNK expPropagationOnNodes ] )

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
                ( m1, Cmd.batch [ LinkToJS.setLayoutNameThenLayout s ] )

        SwitchElemRole network role ->
            let
                m1 =
                    initModelHighlights model
            in
                showView msg (ModelActions.updateNodeRole m1 network role)

        SwitchElemState elemState ->
            let
                m1 =
                    initModelHighlights model
            in
                showView msg (ModelActions.updateState m1 elemState)

        CreateNode ->
            showView msg <| ModelActions.createNode model

        RenameNode ->
            showView msg <| ModelActions.renameNode model

        CreateLink ->
            case model.selection of
                x1 :: x2 :: [] ->
                    showView msg <| ModelActions.createLink x1 x2 model

                _ ->
                    ( model, Cmd.none )

        InputChange s ->
            ( { model | input = s }, Cmd.none )

        InputFileChange s ->
            ( { model | inputFile = s }, Cmd.none )

        Selection s ->
            let
                x =
                    Selection.decodeFromJSMsg s

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
                    ModelActions.loadCsv2Model s model
            in
                showView msg m1

        Csv2ModelToElm s ->
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
                        Model.Flat ->
                            ModelActions.updateLightLayout s model

                        Model.Geometry ->
                            ModelActions.updateGeometryLayout s model

                        _ ->
                            ModelActions.updateLayoutFromNodeId s model
            in
                ( m1, Cmd.none )

        SaveModel ->
            let
                saveName =
                    case String.isEmpty model.inputFile of
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
                    -- shift
                    ( ModelActions.insertKey k model, Cmd.none )

                17 ->
                    -- ctrl
                    ( ModelActions.insertKey k model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        KeyUps k ->
            case k of
                16 ->
                    -- shift
                    ( ModelActions.removeKey k model, Cmd.none )

                17 ->
                    -- ctrl
                    ( ModelActions.removeKey k model, Cmd.none )

                38 ->
                    -- arrow up
                    upView msg model

                45 ->
                    -- insert
                    showView msg (ModelActions.mask model)

                46 ->
                    -- delete
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
                _ =
                    Debug.log "verif" model.dataModel

                dm =
                    Verification.verificationBlocs model.dataModel

                dm2 =
                    Verification.verification dm

                m1 =
                    { model | dataModel = dm2 }
            in
                ( m1, Cmd.none )

        Propagation ->
            if (model.propagationDone == False) then
                let
                    newModel =
                        { model | propagationDone = True }
                in
                    showView msg (ModelActions.updateOutpowered newModel)
            else
                showView msg (initModelHighlights model)
