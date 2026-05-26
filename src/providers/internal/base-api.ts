abstract class BaseApiClient {
  abstract presentChallengeRecord(domain: string, host: string, token: string): Promise<boolean>
  abstract cleanupChallengeRecord(domain: string, host: string): Promise<boolean>
}

export default BaseApiClient
