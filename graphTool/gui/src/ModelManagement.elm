module ModelManagement
    exposing
        ( subBullesModelFromId
        , subBullesModelFromName
        , subBullesModelFromNode
        , subBullesFromUniverse
        , listNodeToPBS
        , listNodeToPBSFromNodeName
        , listNodeToPBSFromNodeId
        , listNodeToPBSFromNode
        , getAscendants
        , getChildren
        , getDescendantsFromN
        , findCommonParent
        , orderingNodesToPBS
        , filterWithMask
        )

import DataModel
import Identifier exposing (Identifier)
import Node exposing (Node)
import Link exposing (Edge)
import Set exposing (Set)


{--filterSameParent list n renvoir la list des noeuds dont le parent == n.parent --}


filterSameParent : List Node -> Node -> List Node
filterSameParent list n =
    List.filter (\x -> x.parent == n.parent) list


filterSameParentWithoutN : List Node -> Node -> List Node
filterSameParentWithoutN list n =
    List.filter
        (\x -> x.parent == n.parent && not (x.id == n.id))
        list



{--
filterEdgeN renvoie la selection des liens pour affichage Bulle

  [ x | (
       (isNodeIdPresent x.source nodes)
      &&
      (isNodeIdPresent x.target nodes)
      )
  ]

      avec nodes = filterBullesNodesN model.nodes n
--}


filterBullesEdgeN : List Edge -> Node -> List Node -> List Edge
filterBullesEdgeN list n nodes =
    List.filter
        (\x ->
            (DataModel.isNodeIdPresent x.source nodes)
                && (DataModel.isNodeIdPresent x.target nodes)
        )
        list


existLinkTo : List Node -> Node -> List Edge -> Bool
existLinkTo list n edges =
    List.any
        (\x ->
            DataModel.isEdgePresent
                --{ id = 0, source = x.id, target = n.id }
                (Link.link x.id n.id)
                edges
        )
        list


subBullesFromUniverse : DataModel.Model -> DataModel.Model
subBullesFromUniverse model =
    let
        newNodes0 =
            List.filter (\x -> (x.parent == Nothing)) model.nodes

        newNodes =
            addBlowToListRecursive newNodes0 model

        newEdges =
            List.filter
                (\x ->
                    (DataModel.isNodeIdPresent x.source newNodes)
                        && (DataModel.isNodeIdPresent x.target newNodes)
                )
                model.edges

        -- newModel = { model | nodes = newNodes, edges = newEdges, curNodeId = model.curNodeId }
    in
        { model | nodes = newNodes, edges = newEdges }


filtNodeWithList_ : List Node -> List Node -> (Edge -> Bool)
filtNodeWithList_ l1 l2 =
    (\x ->
        (DataModel.isNodeIdPresent x.source l1 && DataModel.isNodeIdPresent x.target l2)
            || (DataModel.isNodeIdPresent x.target l1 && DataModel.isNodeIdPresent x.source l2)
    )


isCommonPt_ : List Node -> Node -> Node -> Bool
isCommonPt_ list n x =
    let
        maybe_p =
            findCommonParent list n x

        res =
            case maybe_p of
                Nothing ->
                    (x.parent == Nothing)

                Just p ->
                    (x.parent == Just p.id)
    in
        res


mainFilter_ : Edge -> Node -> DataModel.Model -> List Node -> List Edge -> Bool
mainFilter_ x n model childNodes edges =
    if ((DataModel.isNodeIdPresent x.source childNodes) && (DataModel.isNodeIdPresent x.target childNodes)) then
        True
    else if (x.source == n.id) then
        let
            maybe_node =
                DataModel.getNodeFromId x.target model.nodes

            result =
                case maybe_node of
                    Nothing ->
                        -- ne devrait pas arriver
                        False

                    Just node ->
                        not (DataModel.anyLink childNodes node edges)
        in
            result
    else if (x.target == n.id) then
        let
            maybe_node =
                DataModel.getNodeFromId x.source model.nodes

            result =
                case maybe_node of
                    Nothing ->
                        -- ne devrait pas arriver
                        False

                    Just node ->
                        not (DataModel.anyLink childNodes node edges)
        in
            result
    else
        True


subBullesModelFromNode : DataModel.Model -> Node -> DataModel.Model
subBullesModelFromNode model n =
    let
        childNodes =
            getChildren model.nodes n

        -- on cherche les nodes qui ont un lien avec n
        others =
            List.filter
                (\x ->
                    (existLinkTo [ n ] x model.edges)
                )
                model.nodes

        -- on filtre others tels que ( n.parent == x.parent || x.parent == Nothing )
        -- findCommonParent : List Node -> Node -> Node -> Maybe Node
        -- findCommonParent (others n x) == x.parent
        externNodes =
            List.filter
                (\x ->
                    -- (n.parent == x.parent || x.parent == Nothing)
                    ((isCommonPt_ model.nodes n x) || x.parent == Nothing)
                )
                others

        newNodes0 =
            n :: (List.append childNodes externNodes)

        newNodes =
            addBlowToListRecursive newNodes0 model

        newEdges1 =
            List.filter
                (\x ->
                    (DataModel.isNodeIdPresent x.source newNodes)
                        && (DataModel.isNodeIdPresent x.target newNodes)
                        && -- on filtre les liens entre externes
                           not (DataModel.isNodeIdPresent x.source externNodes && DataModel.isNodeIdPresent x.target externNodes)
                )
                model.edges

        newEdges2 =
            List.filter
                (\x ->
                    (mainFilter_ x n model childNodes newEdges1)
                )
                newEdges1

        newEdges =
            newEdges2

        -- []
    in
        { model
            | nodes = newNodes
            , edges = newEdges
            , curNodeId = 0
        }


subBullesModelFromNode0 : DataModel.Model -> Node -> DataModel.Model
subBullesModelFromNode0 model n =
    let
        childNodes =
            getChildren model.nodes n

        childEdges =
            filterBullesEdgeN model.edges n childNodes

        brosN =
            DataModel.bros n model.nodes

        allParentsN =
            getAllParentsFromNode model.nodes n

        -- liste des noeuds externes moins le parent de n
        externNodesWithoutN =
            List.filter
                (\x ->
                    (x.parent
                        == Nothing
                        && (not (DataModel.isNodePresent x allParentsN))
                    )
                )
                model.nodes

        externEdges =
            List.filter
                (filtNodeWithList_ externNodesWithoutN (n :: childNodes))
                model.edges

        -- on ne conserve que les externals qui on un lien avec un element de childNodes ou n
        externNodes =
            List.filter
                (\x ->
                    (existLinkTo [ n ] x model.edges)
                )
                externNodesWithoutN

        brosEdges =
            List.filter
                (filtNodeWithList_ brosN (n :: childNodes))
                model.edges

        brosNodes =
            List.filter
                (\x ->
                    (existLinkTo [ n ] x model.edges)
                )
                brosN

        newNodes1 =
            n :: List.append brosNodes (List.append childNodes externNodes)

        newNodes =
            addBlowToListRecursive newNodes1 model

        newEdges1 =
            List.append brosEdges (List.append childEdges externEdges)
    in
        { model
            | nodes = newNodes
            , edges = newEdges1
            , curNodeId = 0
        }


subBullesModelFromId : DataModel.Model -> Identifier -> DataModel.Model
subBullesModelFromId model id =
    case DataModel.getNodeFromId id model.nodes of
        Nothing ->
            DataModel.defaultModel

        Just n ->
            subBullesModelFromNode model n


subBullesModelFromName : DataModel.Model -> String -> DataModel.Model
subBullesModelFromName model s =
    case DataModel.getNodeFromName s model.nodes of
        Nothing ->
            DataModel.defaultModel

        Just n ->
            subBullesModelFromNode model n


parentFromNode : List Node -> Node -> Maybe Node
parentFromNode list n =
    case n.parent of
        Nothing ->
            Nothing

        Just id ->
            DataModel.getNodeFromId id list



{--construction de la liste des parents de n --}


getAllParentsFromNode : List Node -> Node -> List Node
getAllParentsFromNode list n =
    getAllParentsFromNode_ list [] n


getAllParentsFromNode_ : List Node -> List Node -> Node -> List Node
getAllParentsFromNode_ list tmp n =
    case DataModel.nodeHasParent n of
        False ->
            tmp

        True ->
            case parentFromNode list n of
                Nothing ->
                    tmp

                Just p ->
                    getAllParentsFromNode_ list (p :: tmp) p


extractAndstopToP_ : List a -> List a -> a -> List a
extractAndstopToP_ list tmp p =
    case list of
        x :: xs ->
            case x == p of
                True ->
                    tmp

                False ->
                    extractAndstopToP_ xs tmp p

        [] ->
            tmp


extractAndstopToP : List a -> a -> List a
extractAndstopToP list p =
    extractAndstopToP_ list [] p


getParentsFromNStopToP : List Node -> Node -> Node -> List Node
getParentsFromNStopToP list n p =
    let
        l1 =
            getAllParentsFromNode list n

        l2 =
            extractAndstopToP l1 p
    in
        l2



{--
listNodeToPBS :
    construction du model PBS . Les liens sont les relations parent -> enfant
--}


nodesToPbsLnk_ : List Node -> List Node -> DataModel.Model -> List Edge -> ( List Edge, DataModel.Model )
nodesToPbsLnk_ list treatedList model tmp =
    case treatedList of
        x :: xs ->
            case x.parent of
                Nothing ->
                    nodesToPbsLnk_ list xs model tmp

                Just pId ->
                    case DataModel.isNodeIdPresent pId list of
                        False ->
                            nodesToPbsLnk_ list xs model tmp

                        True ->
                            let
                                newModel =
                                    DataModel.getNodeIdentifier model

                                edge =
                                    --{ id = newModel.curNodeId, source = pId, target = x.id }
                                    (Link.makeLink newModel.curNodeId pId x.id)

                                tp1 =
                                    edge :: tmp
                            in
                                nodesToPbsLnk_ list xs newModel tp1

        [] ->
            ( tmp, model )


nodesToPbsLnk : List Node -> DataModel.Model -> ( List Edge, DataModel.Model )
nodesToPbsLnk list model =
    let
        ( e, m ) =
            (nodesToPbsLnk_ list list model [])
    in
        ( e, m )


listNtoPBS : List Node -> List Node
listNtoPBS list =
    List.map (\n -> { n | parent = Nothing }) list


listNodeToPBS_ : List Node -> DataModel.Model -> DataModel.Model
listNodeToPBS_ list model =
    let
        newNodes =
            listNtoPBS list

        newModel =
            { model | nodes = newNodes, edges = [], curNodeId = (DataModel.maximumNodeId newNodes) }

        ( newEdges, m2 ) =
            nodesToPbsLnk list newModel
    in
        { m2 | nodes = newNodes, edges = newEdges }


listNodeToPBS : List Node -> DataModel.Model
listNodeToPBS list =
    listNodeToPBS_ list DataModel.defaultModel



{--
listNodeToPBSFromNode : List Node -> Node -> DataModel.Model
--}


listNodeToPBSFromNodeId : List Node -> Identifier -> DataModel.Model
listNodeToPBSFromNodeId list id =
    case (DataModel.getNodeFromId id list) of
        Nothing ->
            DataModel.defaultModel

        Just n ->
            listNodeToPBSFromNode list n


listNodeToPBSFromNodeName : List Node -> String -> DataModel.Model
listNodeToPBSFromNodeName list s =
    case (DataModel.getNodeFromName s list) of
        Nothing ->
            DataModel.defaultModel

        Just n ->
            listNodeToPBSFromNode list n


listNodeToPBSFromNode : List Node -> Node -> DataModel.Model
listNodeToPBSFromNode list n =
    let
        n1 =
            { n | parent = Nothing }

        newList =
            (getDescendantsFromN list n1)

        newModel =
            listNodeToPBS newList
    in
        newModel


getChildren : List Node -> Node -> List Node
getChildren list n =
    (List.filter (\x -> (x.parent == Just n.id)) list)


getDescendants : List Node -> List Node -> List Node
getDescendants list l1 =
    case l1 of
        [] ->
            []

        x :: xs ->
            (List.append (getDescendantsFromN list x) (getDescendants list xs))


getDescendantsFromN : List Node -> Node -> List Node
getDescendantsFromN list n =
    n :: (getDescendants list (getChildren list n))



{--
getAscendants_ list n p tmp

  list : liste des noeuds
  n : noeud de base
  p : maybe noeud qui conditionne l'arret
  tmp : list temporaire

--}


getAscendantsWithP_ : List Node -> Node -> Node -> List Node -> List Node
getAscendantsWithP_ list n p tmp =
    case n.parent of
        Nothing ->
            (n :: tmp)

        Just pId ->
            let
                b =
                    (pId == p.id)

                tmp1 =
                    case b of
                        True ->
                            (n :: tmp)

                        False ->
                            let
                                maybeN =
                                    (DataModel.getNodeFromId pId list)

                                tmp2 =
                                    case maybeN of
                                        Nothing ->
                                            (n :: tmp)

                                        Just q ->
                                            getAscendantsWithP_ list q p (n :: tmp)
                            in
                                tmp2
            in
                tmp1



-- getAscendantsWithParent_ : List Node -> Node -> Node -> List Node -> List Node
-- getAscendantsWithParent_ list n maybe_p tmp =
--     case maybe_p of
--         Nothing ->
--             getAscendants_ list n tmp
--
--         Just p ->
--             []


getAscendants_ : List Node -> Node -> List Node -> List Node
getAscendants_ list n tmp =
    case n.parent of
        Nothing ->
            (n :: tmp)

        Just pId ->
            let
                maybeN =
                    (DataModel.getNodeFromId pId list)

                tmp1 =
                    case maybeN of
                        Nothing ->
                            (n :: tmp)

                        Just p ->
                            getAscendants_ list p (n :: tmp)
            in
                tmp1


getAscendants : List Node -> Node -> Maybe Node -> List Node
getAscendants list n maybe_p =
    let
        result =
            case maybe_p of
                Nothing ->
                    getAscendants_ list n []

                Just p ->
                    getAscendantsWithP_ list n p []
    in
        List.reverse result


findNodeInList_ : Node -> List Node -> Maybe Node
findNodeInList_ n list =
    let
        filterList =
            List.filter (\x -> x.id == n.id) list

        res =
            case filterList of
                [] ->
                    Nothing

                x :: xs ->
                    Just x
    in
        res


findCommonElement_ : List Node -> List Node -> Maybe Node
findCommonElement_ l1 l2 =
    case l1 of
        [] ->
            Nothing

        x :: xs ->
            let
                p =
                    findNodeInList_ x l2

                res =
                    case p of
                        Nothing ->
                            findCommonElement_ xs l2

                        Just p1 ->
                            p
            in
                res



{--
findCommonParent: recherche parent commun aux noeuds n et m
renvoie
    Nothing si pas de parent commun
    Just p si le premier parent commun est p

example:
    lp1 = [a111, a11, a1, a]
    lp2 = [a12, a1, a]

    findCommonParent a111 a12 = a1
--}


findCommonParent : List Node -> Node -> Node -> Maybe Node
findCommonParent list n m =
    let
        lp1 =
            (getAscendants list n Nothing)

        lp2 =
            (getAscendants list m Nothing)

        commonElement =
            findCommonElement_ lp1 lp2
    in
        commonElement



{--
findCommonParent list s1 s2
    list list des noeuds
    s1 nom du noeud n1
    s2 nom du noeud n2
--}


findCommonParentFromString : List Node -> String -> String -> Maybe Node
findCommonParentFromString list s1 s2 =
    let
        maybe_n =
            DataModel.getNodeFromName s1 list

        maybe_m =
            DataModel.getNodeFromName s2 list

        res =
            case ( maybe_n, maybe_m ) of
                ( Just n, Just m ) ->
                    findCommonParent list n m

                ( _, _ ) ->
                    Nothing
    in
        res


orderingNodesToPBS_ : List Node -> DataModel.Model -> List Node
orderingNodesToPBS_ list model =
    case list of
        [] ->
            []

        x :: xs ->
            List.append (getDescendantsFromN model.nodes x) (orderingNodesToPBS_ xs model)



-- on ordonne la liste des nodes en mode PBS : [n,n2,n2.1,n2.2,n1,n1.1,p,p1,p2,p2.1,...]


orderingNodesToPBS : DataModel.Model -> List Node
orderingNodesToPBS model =
    let
        list =
            (List.filter (\x -> x.parent == Nothing) model.nodes)
    in
        orderingNodesToPBS_ list model


maskToNodeList : List Identifier -> List Node -> List Node
maskToNodeList list nodes =
    case list of
        [] ->
            []

        x :: xn ->
            let
                m_n =
                    DataModel.getNodeFromId x nodes

                ln =
                    case m_n of
                        Nothing ->
                            maskToNodeList xn nodes

                        Just n ->
                            n :: (maskToNodeList xn nodes)
            in
                ln


filterNodesWithMask : List Node -> List Node -> List Node
filterNodesWithMask nodesToMask nodes =
    List.filter
        (\x ->
            not (List.member x nodesToMask)
        )
        nodes


filterEdgesWithMask : List Identifier -> List Edge -> List Edge
filterEdgesWithMask idToMask edges =
    List.filter
        (\x ->
            not (List.member x.source idToMask)
                && not (List.member x.target idToMask)
        )
        edges


filterWithMask : DataModel.Model -> DataModel.Model
filterWithMask model =
    let
        lmask =
            Set.toList model.mask

        ln =
            maskToNodeList lmask model.nodes

        -- nodesToMask est la liste des descendants des elements de mask
        nodesToMask =
            List.concat
                (List.map
                    (\x -> getDescendantsFromN model.nodes x)
                    ln
                )

        idToMask =
            List.map (\x -> x.id) nodesToMask

        newNodes =
            filterNodesWithMask nodesToMask model.nodes

        newEdges =
            filterEdgesWithMask idToMask model.edges
    in
        { model
            | nodes =
                newNodes
            , edges = newEdges
        }


addBlowToList : List Node -> DataModel.Model -> List Node
addBlowToList list model =
    case list of
        [] ->
            []

        x :: xs ->
            case x.blow of
                False ->
                    x :: (addBlowToList xs model)

                True ->
                    x :: (addBlowToList (List.append (getChildren model.nodes x) xs) model)


addBlowToListRecursive : List Node -> DataModel.Model -> List Node
addBlowToListRecursive list model =
    addBlowToList list model
