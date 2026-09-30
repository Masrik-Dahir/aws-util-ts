import { PersonalizeRuntimeClient } from "@aws-sdk/client-personalize-runtime";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A single recommended or ranked item. */
export type PersonalizedItem = {
  itemId: string;
  score?: number;
};

/** Result of get_action_recommendations. */
export type GetActionRecommendationsResult = {
  actionList?: Record<string, unknown>[];
  recommendationId?: string;
};

/** Get real-time item recommendations from a Personalize campaign. */
export async function getRecommendations(campaignArn: string): Promise<PersonalizedItem[]> {
  try {
    // TODO: implement get_recommendations
    throw new Error("get_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_recommendations failed");
  }
}

/** Re-rank a list of items for a specific user. */
export async function getPersonalizedRanking(campaignArn: string, userId: string, inputList: string[]): Promise<PersonalizedItem[]> {
  try {
    // TODO: implement get_personalized_ranking
    throw new Error("get_personalized_ranking not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_personalized_ranking failed");
  }
}

/** Get action recommendations. */
export async function getActionRecommendations(): Promise<GetActionRecommendationsResult> {
  try {
    // TODO: implement get_action_recommendations
    throw new Error("get_action_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_action_recommendations failed");
  }
}
