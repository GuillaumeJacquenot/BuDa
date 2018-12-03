module Link
    exposing
        ( Edge
        , ActivePoperties
        , activate
        , unActivate
        , isActive
        , isActiveProperty
        , isEqual
        , link
        , makeLink
        , changeActive
        , changeActiveProperty
        , updateActivePoperties
          -- , Link
        )

import Identifier exposing (Identifier)
import Set exposing (Set)
import Attribut exposing (Attribut)
import Tightness
import ElementAttributes exposing (..)


type alias ActivePoperties =
    Set Identifier


type alias Edge =
    { id : Identifier
    , source : Identifier
    , target : Identifier
    , parameters : ActivePoperties
    , state : ElementState
    , attribut : Maybe Attribut
    , highLighted : Int
    , tightness : Tightness.Model
    }


makeLink : Identifier -> Identifier -> Identifier -> Edge
makeLink i s t =
    { id = i
    , source = s
    , target = t
    , parameters = Set.empty
    , state = RAS
    , attribut = Nothing
    , highLighted = 0
    , tightness = Tightness.default
    }


link : Identifier -> Identifier -> Edge
link s t =
    makeLink 0 s t


isEqual : Edge -> Edge -> Bool
isEqual x e =
    (x.source == e.source && x.target == e.target) || (x.source == e.target && x.target == e.source)


changeActive : Identifier -> Edge -> Edge
changeActive x edge =
    case isActive x edge of
        False ->
            activate x edge

        True ->
            unActivate x edge


changeActiveProperty : Identifier -> ActivePoperties -> ActivePoperties
changeActiveProperty x set =
    case isActiveProperty x set of
        False ->
            activateProperty x set

        True ->
            unActivateProperty x set


isActiveProperty : Identifier -> ActivePoperties -> Bool
isActiveProperty x set =
    Set.member x set


activateProperty : Identifier -> ActivePoperties -> ActivePoperties
activateProperty x set =
    Set.insert x set


unActivateProperty : Identifier -> ActivePoperties -> ActivePoperties
unActivateProperty x set =
    Set.remove x set


isActive : Identifier -> Edge -> Bool
isActive x edge =
    Set.member x edge.parameters


activate : Identifier -> Edge -> Edge
activate x edge =
    let
        new_parameters =
            Set.insert x edge.parameters
    in
        { edge | parameters = new_parameters }


unActivate : Identifier -> Edge -> Edge
unActivate x edge =
    let
        new_parameters =
            Set.remove x edge.parameters
    in
        { edge | parameters = new_parameters }


updateActivePoperties : ActivePoperties -> Edge -> Edge
updateActivePoperties x edge =
    -- on complete les parametres de edge avec x
    let
        newParameters =
            Set.union edge.parameters x
    in
        { edge | parameters = newParameters }
