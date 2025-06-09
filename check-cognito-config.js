// AWS Cognito設定確認スクリプト
const { CognitoIdentityProviderClient, DescribeUserPoolCommand, DescribeUserPoolClientCommand, DescribeIdentityProviderCommand } = require('@aws-sdk/client-cognito-identity-provider');

const region = 'ap-northeast-1';
const userPoolId = 'ap-northeast-1_MvXXrt5uB';
const clientId = '1gujltpeo30a92aogcsv8os2fb';

const client = new CognitoIdentityProviderClient({ region });

async function checkCognitoConfig() {
  try {
    console.log('🔍 AWS Cognito設定を確認中...\n');

    // 1. User Pool基本情報
    console.log('1️⃣ User Pool基本情報:');
    const userPoolResponse = await client.send(new DescribeUserPoolCommand({ UserPoolId: userPoolId }));
    console.log('- Pool Name:', userPoolResponse.UserPool.Name);
    console.log('- Attributes:', userPoolResponse.UserPool.Schema?.filter(attr => attr.Required).map(attr => attr.Name));
    console.log('- Auto Verified Attributes:', userPoolResponse.UserPool.AutoVerifiedAttributes);
    console.log('');

    // 2. App Client設定
    console.log('2️⃣ App Client設定:');
    const clientResponse = await client.send(new DescribeUserPoolClientCommand({ 
      UserPoolId: userPoolId, 
      ClientId: clientId 
    }));
    
    const clientConfig = clientResponse.UserPoolClient;
    console.log('- Client Name:', clientConfig.ClientName);
    console.log('- Supported Identity Providers:', clientConfig.SupportedIdentityProviders);
    console.log('- Callback URLs:', clientConfig.CallbackURLs);
    console.log('- Logout URLs:', clientConfig.LogoutURLs);
    console.log('- OAuth Flows:', clientConfig.AllowedOAuthFlows);
    console.log('- OAuth Scopes:', clientConfig.AllowedOAuthScopes);
    console.log('- Read Attributes:', clientConfig.ReadAttributes);
    console.log('- Write Attributes:', clientConfig.WriteAttributes);
    console.log('');

    // 3. Google Identity Provider設定
    console.log('3️⃣ Google Identity Provider設定:');
    try {
      const googleProviderResponse = await client.send(new DescribeIdentityProviderCommand({
        UserPoolId: userPoolId,
        ProviderName: 'Google'
      }));
      
      const googleProvider = googleProviderResponse.IdentityProvider;
      console.log('- Provider Name:', googleProvider.ProviderName);
      console.log('- Provider Type:', googleProvider.ProviderType);
      console.log('- Attribute Mapping:', googleProvider.AttributeMapping);
      console.log('- Provider Details:', googleProvider.ProviderDetails);
    } catch (error) {
      console.log('❌ Google Identity Providerが設定されていません');
      console.log('エラー:', error.message);
    }

  } catch (error) {
    console.error('❌ 設定確認中にエラーが発生しました:');
    console.error(error.message);
    console.error('\n💡 AWS認証情報が設定されているか確認してください:');
    console.error('- AWS CLI: aws configure');
    console.error('- 環境変数: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
  }
}

checkCognitoConfig();