import {getHomogeneousValueDefinition} from "../data/homogeneousValues/index.ts";
import type {HomogeneousValueDisplayMethod, HomogeneousValueEffect, HomogeneousValueRoleKeyword} from "./homogeneousValues.ts";
import {getContributionRoleKeyword, getEffectKeywords} from "./homogeneousValueResolution.ts";

type HomogeneousContributionEntity = {
    values?: readonly HomogeneousValueEffect[];
};

const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
});

export function getHomogeneousProductionContributions(
    entity: HomogeneousContributionEntity,
): HomogeneousValueEffect[] {
    return getHomogeneousContributionsByRole(entity, ["production"]);
}

export function getHomogeneousRequirementContributions(
    entity: HomogeneousContributionEntity,
): HomogeneousValueEffect[] {
    return getHomogeneousContributionsByRole(entity, ["upkeep", "unlock"]);
}

export function formatHomogeneousValue(
    valueId: string,
    rawValue: number,
    contributionKeywords: readonly string[] = [],
): string {
    const definition = getHomogeneousValueDefinition(valueId);
    const displayKeywords = contributionKeywords.filter((keyword) => keyword.startsWith("display."));

    if (displayKeywords.length > 0) {
        throw new Error(`Homogeneous value ${valueId} must use displayMethod instead of display keywords: ${displayKeywords.join(", ")}`);
    }

    const displayMethod: HomogeneousValueDisplayMethod = definition?.displayMethod ?? "default";

    switch (displayMethod) {
        case "integer":
            return integerFormatter.format(rawValue);
        case "percent":
            return `${numberFormatter.format(rawValue * 100)}%`;
        case "multiplier":
            return `${numberFormatter.format(rawValue)}x`;
        case "seconds":
            return `${numberFormatter.format(rawValue)}s`;
        case "distance":
            return `${numberFormatter.format(rawValue)} px`;
        case "kilometers":
            return `${numberFormatter.format(rawValue)} km`;
        case "triggerTolerance":
            return formatTriggerTolerance(rawValue);
        case "damaged":
        case "default":
        default:
            return numberFormatter.format(rawValue);
    }
}

function formatTriggerTolerance(rawValue: number): string {
    if (rawValue <= 0) return "zero";
    if (rawValue <= 0.01) return "perfect";
    if (rawValue <= 0.03) return "tight";
    if (rawValue <= 0.06) return "medium";
    if (rawValue <= 0.12) return "better";
    return "low";
}

function getHomogeneousContributionsByRole(
    entity: HomogeneousContributionEntity,
    roleKeywords: readonly HomogeneousValueRoleKeyword[],
): HomogeneousValueEffect[] {
    return getEntityHomogeneousContributions(entity).filter((contribution) => {
        const contributionRoleKeyword = getContributionRoleKeyword(
            getEffectKeywords(contribution),
            contribution.valueId,
        );

        return roleKeywords.includes(contributionRoleKeyword);
    });
}

function getEntityHomogeneousContributions(entity: HomogeneousContributionEntity): readonly HomogeneousValueEffect[] {
    return entity.values ?? [];
}
