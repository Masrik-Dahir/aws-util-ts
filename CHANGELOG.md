# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Added 40 missing AWS SDK v3 client packages to `package.json`: `apprunner`, `autoscaling`, `batch`, `bedrock-agent`, `cloudfront`, `codedeploy`, `codestar-connections`, `cognito-identity`, `databrew`, `dms`, `docdb`, `eks`, `elasticbeanstalk`, `emr`, `emr-containers`, `forecast`, `forecastquery`, `greengrassv2`, `health`, `iot`, `iot-data`, `iotsitewise`, `kafka`, `keyspaces`, `kinesisanalyticsv2`, `lexv2-models`, `lexv2-runtime`, `neptune`, `personalize`, `personalize-runtime`, `polly`, `rds-data`, `redshift`, `sagemaker-featurestore-runtime`, `sagemaker-runtime`, `service-quotas`, `sesv2`, `timestream-write`, `transcribe`, `vpc-lattice`
- Removed stale `@aws-sdk/client-apigatewaymanagementapi` (not imported anywhere in source)
- Updated `package.json` description to reflect current 135+ module count; added `zod` and `aws-sdk-v3` keywords
- Updated masrikdahir.com documentation: TypeScript API reference now reflects 147 modules, 7,778 functions, and 5,449 Zod model types; added 11 new module entries (analytics-pipelines, api-gateway, api-gateway-ops, cache-ops, ci-cd-ops, contact-center-ops, ecr, finding-ops, governance, media-processing, storage-ops); updated 10 extended module entries
- Production-grade README.md with animated SVG banners, hero screenshot mockup, TL;DR, Mermaid architecture/structure diagrams, full usage examples, and contributing guide
- Animated author banner (`cloud-packet-burst.svg`) — network packet stream animation in `.github/banners/`
- Animated project banner (`sdk-circuit-trace.svg`) — PCB circuit trace animation in `.github/banners/`
- Hero screenshot SVG (`hero.svg`) — syntax-highlighted code editor mockup in `.github/screenshots/`
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) — type-check, lint, build, test across Node 18/20/22
- GitHub Actions banner-archive workflow (`.github/workflows/banner-archive.yml`)
- Dependabot config (`.github/dependabot.yml`) — weekly npm and actions updates
- Banner manifest (`.github/banners/manifest.json`) — tracks all used animation concepts
- 10 new source modules: `api-gateway-ops`, `contact-center-ops`, `media-processing`, `cache-ops`, `ci-cd-ops`, `storage-ops`, `governance`, `finding-ops`, `analytics-pipelines` — covering 100 new functions and 100 matching Zod result schemas
- Extended 10 existing modules with stub functions and schemas: `ai-ml-pipelines` (+11), `security-ops` (+6), `cost-optimization` (+8), `networking` (+4), `observability` (+4), `deployment` (+8), `resilience` (+1), `config-loader` (+2), `data-flow-etl` (+5), `resource-ops` (+1)
- 27 new AWS SDK v3 client dependencies added to `package.json`: `accessanalyzer`, `apigatewayv2`, `bedrock-agent-runtime`, `cloudtrail`, `codeartifact`, `codebuild`, `codecommit`, `codepipeline`, `connect`, `detective`, `efs`, `elasticache`, `emr-serverless`, `fsx`, `inspector2`, `ivs`, `lightsail`, `macie2`, `mediaconvert`, `memorydb`, `neptune-graph`, `organizations`, `quicksight`, `redshift-data`, `redshift-serverless`, `securityhub`, `sso-admin`, `storage-gateway`, `timestream-query`, `transfer`
- ~70 new service modules covering all AWS services (generated from Python source of truth)
- ~2,743 additional function stubs + 2,183 types across all 135 modules achieving full function parity with Python source of truth
- Cross-project sync rule in CLAUDE.md linking all companion implementations (Python, C#, Go, Java, Rust, Ruby)
- Skills submodule setup in CLAUDE.md

## [1.0.0] - 2026-04-13

### Added
- Initial release — TypeScript port of aws-util with 61 modules covering 32+ AWS services
