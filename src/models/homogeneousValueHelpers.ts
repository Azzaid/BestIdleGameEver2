import {getHomogeneousValueDefinition} from "../data/homogeneousValues/index.ts";
import type {HomogeneousValueEffect, HomogeneousValueRoleKeyword} from "./homogeneousValues.ts";
import {getContributionRoleKeyword, getEffectKeywords} from "./homogeneousValueResolution.ts";

type HomogeneousContributionEntity = {
    homogeneousValueEffects?: readonly HomogeneousValueEffect[];
    homogeneousContributions?: readonly HomogeneousValueEffect[];
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
    const allKeywords = new Set([
        ...(definition?.keywords ?? []),
        ...contributionKeywords,
    ]);
    const displayKeywords = [...allKeywords].filter((keyword) => keyword.startsWith("display."));

    if (displayKeywords.length > 1) {
        throw new Error(`Homogeneous value ${valueId} has multiple display keywords: ${displayKeywords.join(", ")}`);
    }

    const displayKeyword = displayKeywords[0] ?? "display.default";

    switch (displayKeyword) {
        case "display.integer":
            return integerFormatter.format(rawValue);
        case "display.percent":
            return `${numberFormatter.format(rawValue * 100)}%`;
        case "display.multiplier":
            return `${numberFormatter.format(rawValue)}x`;
        case "display.seconds":
            return `${numberFormatter.format(rawValue)}s`;
        case "display.distance":
            return `${numberFormatter.format(rawValue)} px`;
        case "display.triggerTolerance":
            return formatTriggerTolerance(rawValue);
        case "display.damaged":
        case "display.default":
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
    return entity.homogeneousValueEffects ?? entity.homogeneousContributions ?? [];
}
