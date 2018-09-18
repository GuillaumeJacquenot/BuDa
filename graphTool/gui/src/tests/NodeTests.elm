module NodeTests exposing (..)

import Test exposing (..)
import Expect exposing (..)
import DataModel exposing (Model, dataModelToModel)
import Node
import DataModelActions


emptyModel : DataModel.Model
emptyModel =
    DataModel.defaultModel


suite : Test
suite =
    describe "CRUD on Nodes"
        [ test "create node" <|
            \_ ->
                let
                    testModel =
                        DataModelActions.createNode "A" Nothing emptyModel

                    nodes =
                        [ Node.node 1 "A" Nothing ]
                in
                    Expect.equal testModel.nodes nodes
        ]
