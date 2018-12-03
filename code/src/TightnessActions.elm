module TightnessActions exposing (updateTightnessForEdgeId, removeAllTightness)

import Tightness
import Identifier exposing (Identifier)
import Link exposing (Edge)


updateTightnessForEdgeId : Identifier -> Identifier -> List Edge -> List Edge
updateTightnessForEdgeId id edgeId edges =
    List.map
        (\x ->
            case x.id == edgeId of
                False ->
                    x

                True ->
                    { x | tightness = Tightness.updateTightness id x.tightness }
        )
        edges


removeAllTightness : Identifier -> List Edge -> List Edge
removeAllTightness id edges =
    List.map (\x -> { x | tightness = Tightness.removeTightness id x.tightness }) edges
