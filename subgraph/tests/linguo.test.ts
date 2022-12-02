import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { AppealContribution } from "../generated/schema"
import { AppealContribution as AppealContributionEvent } from "../generated/Linguo/Linguo"
import { handleAppealContribution } from "../src/linguo"
import { createAppealContributionEvent } from "./linguo-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _taskID = BigInt.fromI32(234)
    let _party = 123
    let _contributor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _amount = BigInt.fromI32(234)
    let newAppealContributionEvent = createAppealContributionEvent(
      _taskID,
      _party,
      _contributor,
      _amount
    )
    handleAppealContribution(newAppealContributionEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AppealContribution created and stored", () => {
    assert.entityCount("AppealContribution", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AppealContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_taskID",
      "234"
    )
    assert.fieldEquals(
      "AppealContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_party",
      "123"
    )
    assert.fieldEquals(
      "AppealContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_contributor",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AppealContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_amount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
