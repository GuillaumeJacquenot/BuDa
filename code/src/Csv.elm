module Csv exposing (testAddBloc, testAddCsvToModel, stringToCsvLine, loadCsvModel)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import DataModelActions


-- import Regex


type alias CsvLine =
    { name : String
    , denomination : String
    , refAboutissant1 : String
    , refAboutissant2 : String
    , parameter : String
    }


defaultCsvLine : CsvLine
defaultCsvLine =
    { name = ""
    , denomination = ""
    , refAboutissant1 = ""
    , refAboutissant2 = ""
    , parameter = ""
    }


type alias CsvModel =
    List CsvLine


loadCsvModel : String -> Model -> Model
loadCsvModel s model =
    testAddCsvToModel (List.map (\x -> stringToCsvLine x) (String.lines s)) model


testAddCsvToModel : List CsvLine -> Model -> Model
testAddCsvToModel list model =
    let
        l1 =
            List.filter (\x -> isValidLineForBloc_ x) list

        m1 =
            List.foldr (\x -> addBlocToModel_ x.name) model l1

        m2 =
            List.foldr (\x -> addLinkFromCsvLine_ x) m1 list
    in
        m2


testAddBloc : List String -> Model -> Model
testAddBloc list model =
    case list of
        [] ->
            model

        x :: xs ->
            testAddBloc xs (addBlocToModel_ x model)


cons : List String -> CsvLine
cons list =
    case list of
        x1 :: x2 :: x3 :: x4 :: x5 :: xs ->
            { defaultCsvLine
                | name = x1
                , denomination = x2
                , refAboutissant1 = x3
                , refAboutissant2 = x4
                , parameter = x5
            }

        _ ->
            defaultCsvLine


stringToCsvLine : String -> CsvLine
stringToCsvLine s =
    let
        list =
            String.split ";" s

        -- z =
        --     Debug.log "stringToCsvLine" list
    in
        cons list



-- case list of
--     [] ->
--         model
--
--     x :: xs ->
--         testAddCsvToModel xs (addCsvLine_ x model)


addLinkFromCsvLine_ : CsvLine -> Model -> Model
addLinkFromCsvLine_ csvLine model =
    case isValidLineForLink_ csvLine model of
        True ->
            addLinkToModel_ csvLine model

        False ->
            model


getFirstName_ : String -> String
getFirstName_ s =
    String.slice 0 1 s


getSecondName_ : String -> String
getSecondName_ s =
    String.slice 0 2 s


addLinkToModel_ : CsvLine -> Model -> Model
addLinkToModel_ csvLine model =
    let
        m_id1 =
            DataModel.getNodeIdFromName csvLine.refAboutissant1 model.nodes

        m_id2 =
            DataModel.getNodeIdFromName csvLine.refAboutissant2 model.nodes

        -- z =
        --     Debug.log "Req CreateLink " ( csvLine.refAboutissant1, csvLine.refAboutissant2 )
        m1 =
            case ( m_id1, m_id2 ) of
                ( Just id1, Just id2 ) ->
                    case (id1 == id2) of
                        True ->
                            model

                        False ->
                            let
                                -- z =
                                --     Debug.log "CreateLink OK"
                                m2 =
                                    DataModelActions.createLink id1 id2 model

                                m3 =
                                    case not (String.isEmpty csvLine.parameter) of
                                        True ->
                                            let
                                                m21 =
                                                    DataModelActions.createParameter csvLine.parameter m2

                                                m_edge =
                                                    DataModel.getEdgeFromNodesName csvLine.refAboutissant1 csvLine.refAboutissant2 m21

                                                m22 =
                                                    case m_edge of
                                                        Just edge ->
                                                            DataModelActions.updateProperty edge csvLine.parameter m21

                                                        Nothing ->
                                                            m21
                                            in
                                                m22

                                        False ->
                                            m2
                            in
                                m3

                _ ->
                    model
    in
        m1


addBlocToModel_ : String -> Model -> Model
addBlocToModel_ s model =
    let
        firstBloc =
            getFirstName_ s

        secondBloc =
            getSecondName_ s

        nameBloc =
            s

        m1 =
            addFirstBlocToModel_ firstBloc model

        m_id =
            DataModel.getNodeIdFromNameAndParent firstBloc Nothing m1.nodes

        m2 =
            addSecondBlocToModel_ m_id secondBloc m1

        m_id2 =
            DataModel.getNodeIdFromNameAndParent secondBloc m_id m2.nodes

        m3 =
            addEndBlocToModel_ m_id2 s m2
    in
        m3


addFirstBlocToModel_ : String -> Model -> Model
addFirstBlocToModel_ s model =
    case (DataModel.getNodeFromNameAndParent s Nothing model.nodes) of
        Nothing ->
            (DataModelActions.createNode s Nothing model)

        Just n ->
            model


addSecondBlocToModel_ : Maybe Identifier -> String -> Model -> Model
addSecondBlocToModel_ m_p s model =
    case (DataModel.getNodeFromNameAndParent s m_p model.nodes) of
        Nothing ->
            (DataModelActions.createNode s m_p model)

        Just n ->
            model


addEndBlocToModel_ : Maybe Identifier -> String -> Model -> Model
addEndBlocToModel_ m_id s model =
    addSecondBlocToModel_ m_id s model


isValidLineForBloc_ : CsvLine -> Bool
isValidLineForBloc_ csvLine =
    String.isEmpty csvLine.refAboutissant1
        && String.isEmpty csvLine.refAboutissant2
        && isValidName_ csvLine.name


isBlocInModel_ : String -> Model -> Bool
isBlocInModel_ s model =
    DataModel.isNamePresent s model.nodes


isValidLineForLink_ : CsvLine -> Model -> Bool
isValidLineForLink_ csvLine model =
    let
        b =
            (not (String.isEmpty csvLine.refAboutissant1))
                && (not (String.isEmpty csvLine.refAboutissant2))
                && (not (csvLine.refAboutissant2 == csvLine.refAboutissant1))
                && ((isBlocInModel_ csvLine.refAboutissant1 model))
                && ((isBlocInModel_ csvLine.refAboutissant2 model))

        -- z =
        --     Debug.log "isValidLineForLink_" ( csvLine, b )
    in
        b


addBlocFromCsvToModel_ : CsvLine -> Model -> Model
addBlocFromCsvToModel_ csvLine model =
    case (isValidLineForBloc_ csvLine) of
        False ->
            model

        True ->
            addBlocToModel_ csvLine.name model



-- addBlocToList_ : String -> List Node -> List Node
-- addBlocToList_ s list =


isValidName_ : String -> Bool
isValidName_ s =
    String.length s >= 3



-- addListToModel_ : Model -> String -> List String -> Model
-- addListToModel_ model parent list =
--     case list of
--         [] ->
--             model
--
--         x :: xs ->
--             addListToModel_ (DataModel.addNewNodeToModel x parent model) x xs
--
--
-- stringToNodeNameList_ : String -> List String
-- stringToNodeNameList_ s =
--     (Regex.split Regex.All (Regex.regex "/") s)
--
--
-- importNodeLineFromCsv : String -> Model -> Model
-- importNodeLineFromCsv s model =
--     addListToModel_ model "" (stringToNodeNameList_ s)
--
--
-- stringToLinkDatas_ : String -> List String
-- stringToLinkDatas_ s =
--     Regex.split Regex.All (Regex.regex ";") s
--
--
-- importEdgeLineFromCsv : String -> Model -> Model
-- importEdgeLineFromCsv s model =
--     let
--         list =
--             stringToLinkDatas_ s
--     in
--         model
