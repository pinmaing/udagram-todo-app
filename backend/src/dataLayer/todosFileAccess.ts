import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoFileAccess {

  constructor(
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getUploadUrl(todoId: string): Promise<string> {
    const url = await this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })

    return url
  }

  async deleteAttachment(todoId: string) {
    var params = {  Bucket: this.bucketName, Key: todoId };
    await this.s3.deleteObject(params).promise()
  }
}
