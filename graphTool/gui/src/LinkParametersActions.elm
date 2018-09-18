module LinkParametersActions exposing (activateParameter, unActivateParameter, unActivateAllParameters, activateParameters)

import Identifier exposing (Identifier)
import Node exposing (Node)
import Link exposing (Edge)
import DataModel exposing (Model)
import ModelManagement
import Set exposing (Set)


{--
////////////////////////////////////////////////////////////////////////////////
unActivateParameter
////////////////////////////////////////////////////////////////////////////////

--}


unActivateAllParameters : Edge -> Model -> Model
unActivateAllParameters edge model =
    unActivateAllParameters_ (Set.toList edge.parameters) edge model


unActivateAllParameters_ : List Identifier -> Edge -> Model -> Model
unActivateAllParameters_ list edge model =
    case list of
        [] ->
            model

        x :: xs ->
            unActivateAllParameters_ xs edge (unActivateParameter x edge model)


unActivateParameter : Identifier -> Edge -> Model -> Model
unActivateParameter idx edge model =
    let
        ns =
            (DataModel.getNodeFromId edge.source model.nodes)

        nt =
            (DataModel.getNodeFromId edge.target model.nodes)

        newModel =
            case ( ns, nt ) of
                ( Just ns1, Just nt1 ) ->
                    unActivateParameter_ idx ns1 nt1 model

                ( _, _ ) ->
                    model
    in
        newModel


unActivateParameter_ : Identifier -> Node -> Node -> Model -> Model
unActivateParameter_ idx n m model =
    let
        m1 =
            unActivateParameterDown_ idx n m model

        m2 =
            unActivateParameterUp_ idx n m m1
    in
        m2


unActivateParameterUp_ : Identifier -> Node -> Node -> Model -> Model
unActivateParameterUp_ idx n m model =
    let
        commonParent =
            ModelManagement.findCommonParent model.nodes n m

        asc_n =
            ModelManagement.getAscendants model.nodes n commonParent

        asc_m =
            ModelManagement.getAscendants model.nodes m commonParent
    in
        unActivateParameterUpForLists_ idx asc_n asc_m model


unActivateParameterUpForLists_ : Identifier -> List Node -> List Node -> Model -> Model
unActivateParameterUpForLists_ idx ls lt model =
    case ls of
        [] ->
            model

        x :: xs ->
            unActivateParameterUpForLists_ idx xs lt (unActivateParameterUpForOneList_ idx lt x.id model)


unActivateParameterUpForOneList_ : Identifier -> List Node -> Identifier -> Model -> Model
unActivateParameterUpForOneList_ idx list nId model =
    case list of
        [] ->
            model

        x :: xs ->
            let
                m1 =
                    unActivateParameterUpForOneList_ idx xs nId (unActivateParameterUpForEdge_ idx x.id nId model)
            in
                m1


canUnactivate : Identifier -> Identifier -> Identifier -> Model -> Bool
canUnactivate idx mId nId model =
    let
        maybe_n =
            DataModel.getNodeFromId nId model.nodes

        maybe_m =
            DataModel.getNodeFromId mId model.nodes

        newModel =
            case ( maybe_n, maybe_m ) of
                ( Just n, Just m ) ->
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
                            DataModel.anyLinksParameter idx childs_plus_m childs_n model.edges

                        b2 =
                            DataModel.anyLinksParameter idx childs_plus_n childs_m model.edges

                        b =
                            not (b1 || b2)
                    in
                        b

                ( _, _ ) ->
                    -- ne devrait jamais arriver
                    True
    in
        newModel


unActivateParameterUpForEdge_ : Identifier -> Identifier -> Identifier -> Model -> Model
unActivateParameterUpForEdge_ idx mId nId model =
    case (canUnactivate idx mId nId model) of
        False ->
            model

        True ->
            unActivateParameterUpEdge_ idx mId nId model


unActivateParameterUpEdge_ : Identifier -> Identifier -> Identifier -> Model -> Model
unActivateParameterUpEdge_ idx mId nId model =
    let
        edge =
            (Link.link mId nId)

        newEdges =
            updatePropertyInEdgeList_ edge idx model.edges Link.unActivate

        m_e =
            DataModel.getEdgeFromNodesId mId nId newEdges
    in
        { model | edges = newEdges }


unActivateParameterDown_ : Identifier -> Node -> Node -> Model -> Model
unActivateParameterDown_ idx n m model =
    let
        n_descendants =
            ModelManagement.getDescendantsFromN model.nodes n

        m_descendants =
            ModelManagement.getDescendantsFromN model.nodes m

        m1 =
            unActivateParameterDownForLists_ idx n_descendants m_descendants model
    in
        m1


unActivateParameterDownForLists_ : Identifier -> List Node -> List Node -> Model -> Model
unActivateParameterDownForLists_ idx ls lt model =
    case ls of
        [] ->
            model

        x :: xs ->
            unActivateParameterDownForLists_ idx xs lt (unActivateParameterDownForOneList_ idx lt x.id model)


unActivateParameterDownForOneList_ : Identifier -> List Node -> Identifier -> Model -> Model
unActivateParameterDownForOneList_ idx list nId model =
    case list of
        [] ->
            model

        x :: xs ->
            let
                m1 =
                    unActivateParameterDownForOneList_ idx xs nId (unActivateParameterDownForEdge_ idx x.id nId model)
            in
                m1


unActivateParameterDownForEdge_ : Identifier -> Identifier -> Identifier -> Model -> Model
unActivateParameterDownForEdge_ idx mId nId model =
    let
        edge =
            (Link.link mId nId)

        newEdges =
            updatePropertyInEdgeList_ edge idx model.edges Link.unActivate

        m_e =
            DataModel.getEdgeFromNodesId mId nId newEdges
    in
        { model | edges = newEdges }



{--
////////////////////////////////////////////////////////////////////////////////
activateParameters:
activateParameter dans tous les edges de la liste présents dans le modèle
cette fonction est utile pour le CtrlV de ModelActions, ou on doit repositionner les
paramètres
////////////////////////////////////////////////////////////////////////////////

--}


activateParameters : List Edge -> Model -> Model
activateParameters edges model =
    case edges of
        [] ->
            model

        x :: xs ->
            activateParameters xs (activateParametersForOneEdge_ (Set.toList x.parameters) x model)


activateParametersForOneEdge_ : List Identifier -> Edge -> Model -> Model
activateParametersForOneEdge_ list edge model =
    --List.map (\p -> activateParameter p edge model) (Set.toList parameters)
    case list of
        [] ->
            model

        x :: xs ->
            activateParametersForOneEdge_ xs edge (activateParameter x edge model)



{--
////////////////////////////////////////////////////////////////////////////////
activateParameter:
fonction activate ascendante
////////////////////////////////////////////////////////////////////////////////

--}


activateParameter : Identifier -> Edge -> Model -> Model
activateParameter idx edge model =
    let
        ns =
            (DataModel.getNodeFromId edge.source model.nodes)

        nt =
            (DataModel.getNodeFromId edge.target model.nodes)

        newModel =
            case ( ns, nt ) of
                ( Just ns1, Just nt1 ) ->
                    activateParameter_ idx ns1 nt1 model

                ( _, _ ) ->
                    model
    in
        newModel


activateParameter_ : Identifier -> Node -> Node -> Model -> Model
activateParameter_ idx n m model =
    let
        commonParent =
            ModelManagement.findCommonParent model.nodes n m

        ln =
            (ModelManagement.getAscendants model.nodes n commonParent)

        lm =
            (ModelManagement.getAscendants model.nodes m commonParent)

        m2 =
            activateParameterForLists_ idx ln lm model
    in
        m2


activateParameterForLists_ : Identifier -> List Node -> List Node -> Model -> Model
activateParameterForLists_ idx ls lt model =
    case ls of
        [] ->
            model

        x :: xs ->
            activateParameterForLists_ idx xs lt (activateParameterForOneList_ idx lt x.id model)


activateParameterForOneList_ : Identifier -> List Node -> Identifier -> Model -> Model
activateParameterForOneList_ idx list nId model =
    case list of
        [] ->
            model

        x :: xs ->
            let
                m1 =
                    activateParameterForOneList_ idx xs nId (activateParameterForEdge_ idx x.id nId model)
            in
                m1


activateParameterForEdge_ : Identifier -> Identifier -> Identifier -> Model -> Model
activateParameterForEdge_ idx mId nId model =
    let
        edge =
            (Link.link mId nId)

        newEdges =
            updatePropertyInEdgeList_ edge idx model.edges Link.activate

        m_e =
            DataModel.getEdgeFromNodesId mId nId newEdges
    in
        { model | edges = newEdges }


updatePropertyInEdgeList_ : Edge -> Identifier -> List Edge -> (Identifier -> Edge -> Edge) -> List Edge
updatePropertyInEdgeList_ x idx list func =
    List.map (\y -> processProperty_ x idx y func) list


processProperty_ : Edge -> Identifier -> Edge -> (Identifier -> Edge -> Edge) -> Edge
processProperty_ x idx edge func =
    case
        Link.isEqual x edge
    of
        False ->
            edge

        True ->
            func idx edge
