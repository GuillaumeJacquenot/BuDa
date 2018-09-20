module Export exposing (encodeNodes, encodeLinks, encodePropagation)

import Identifier exposing (Identifier)
import DataModel exposing (Model)
import Node exposing (Node)
import Link exposing (Edge, ActivePoperties)
import Attribut exposing (Attribut)
import DataModelActions exposing (getAscendantName)
import ModelManagement
import Set exposing (Set)
import LinkParameters
import String
import Groups
import Propagation exposing (getStateSummary)


separator : String
separator =
    ";"


slash : String
slash =
    "/"


cr : String
cr =
    "\n"


attributToString : Maybe Attribut -> String
attributToString at =
    case at of
        Nothing ->
            "Nothing"

        Just s ->
            s


listToString : List Identifier -> Groups.Model -> String
listToString list groups =
    case list of
        [] ->
            ""

        x :: xs ->
            case Groups.getPropertyStringFromId x groups of
                Nothing ->
                    ""

                Just s ->
                    s
                        ++ case xs of
                            [] ->
                                ""

                            _ ->
                                ", " ++ (listToString xs groups)


functionalChainToString : Set.Set Identifier -> Groups.Model -> String
functionalChainToString ens groups =
    listToString (Set.toList ens) groups


nodeEncode_ : Node -> Model -> String
nodeEncode_ n model =
    (getAscendantName n model) ++ cr ++ (attributToString n.attribut) ++ cr ++ (functionalChainToString n.group model.groups)


nodeListEncode_ : List Node -> Model -> String
nodeListEncode_ list model =
    case list of
        [] ->
            ""

        x :: xs ->
            (nodeEncode_ x model) ++ cr ++ cr ++ (nodeListEncode_ xs model)


encodeNodes : Model -> String
encodeNodes model =
    let
        -- on ordonne la liste des nodes en mode PBS
        list =
            ModelManagement.orderingNodesToPBS model
    in
        nodeListEncode_ list model


propagationNodeEncode : Node -> { ko : Set Identifier, affected : Set Identifier } -> Model -> String
propagationNodeEncode node stateSummary model =
    let
        state =
            if Set.member node.id stateSummary.ko then
                "KO"
            else if Set.member node.id stateSummary.affected then
                "Impacted"
            else
                "OK"
    in
        -- Build : PBS/Path/to/node;state
        (getAscendantName node model) ++ separator ++ state


propagationEncode : List Node -> { ko : Set Identifier, affected : Set Identifier } -> Model -> String
propagationEncode list stateSummary model =
    case list of
        [] ->
            ""

        firstNode :: nextNodes ->
            (propagationNodeEncode firstNode stateSummary model) ++ cr ++ (propagationEncode nextNodes stateSummary model)


encodePropagation : Model -> String
encodePropagation model =
    let
        -- on ordonne la liste des nodes en mode PBS
        orderedNodes : List Node
        orderedNodes =
            ModelManagement.orderingNodesToPBS model

        stateSummary =
            getStateSummary model.nodes model.edges <| List.map .id model.parameters
    in
        propagationEncode orderedNodes stateSummary model


isActiveProperty : ActivePoperties -> LinkParameters.Property -> Bool
isActiveProperty list p =
    Set.member p.id list


propertiesToCSV : ActivePoperties -> List LinkParameters.Property -> String -> String
propertiesToCSV lId list s =
    case list of
        [] ->
            s

        x :: xs ->
            let
                res =
                    case isActiveProperty lId x of
                        True ->
                            "1"

                        False ->
                            "0"

                s1 =
                    case List.length xs of
                        0 ->
                            case String.length s of
                                0 ->
                                    res

                                _ ->
                                    s ++ separator ++ res

                        _ ->
                            case String.length s of
                                0 ->
                                    (propertiesToCSV lId xs res)

                                _ ->
                                    (propertiesToCSV lId xs (s ++ separator ++ res))
            in
                s1


parametersToCSV : ActivePoperties -> Model -> String
parametersToCSV parameters model =
    propertiesToCSV parameters model.parameters ""


edgeToCSV : Edge -> Model -> String
edgeToCSV edge model =
    let
        m_s =
            DataModel.getNodeFromId edge.source model.nodes

        m_t =
            DataModel.getNodeFromId edge.target model.nodes

        s =
            case ( m_s, m_t ) of
                ( Just s, Just t ) ->
                    (getAscendantName s model)
                        ++ separator
                        ++ (getAscendantName t model)
                        ++ separator
                        ++ (parametersToCSV edge.parameters model)
                        ++ separator
                        ++ (attributToString edge.attribut)

                ( _, _ ) ->
                    "ERREUR;;;;;;;;;;;;"
    in
        s


edgeListEncode_ : List Edge -> Model -> String
edgeListEncode_ list model =
    case list of
        [] ->
            ""

        x :: xs ->
            (edgeToCSV x model) ++ cr ++ (edgeListEncode_ xs model)


parametersHeader_ : LinkParameters.Model -> String
parametersHeader_ list =
    case list of
        [] ->
            "parameters"

        x :: xs ->
            case List.length xs of
                0 ->
                    x.name

                _ ->
                    x.name ++ separator ++ (parametersHeader_ xs)


parametersHeader : Model -> String
parametersHeader model =
    parametersHeader_ model.parameters


edgesEncodeHeader : Model -> String
edgesEncodeHeader model =
    "source" ++ separator ++ "target" ++ separator ++ (parametersHeader model) ++ separator ++ "attribut"


encodeLinks : Model -> String
encodeLinks model =
    (edgesEncodeHeader model) ++ cr ++ (edgeListEncode_ model.edges model)
