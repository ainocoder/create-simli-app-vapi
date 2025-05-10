import 'dart:html' as html;

Future<bool> simliVapiPlayer(
  String? faceId,
  String? agentId,
  bool? autoplay,
) async {
  final url =
      Uri(
        scheme: 'https',
        host: 'create-simli-app-vapi-production.up.railway.app',
        path: '/',
        queryParameters: {
          'faceId': faceId ?? '',
          'agentId': agentId ?? '',
          'autoplay': (autoplay ?? true).toString(),
        },
      ).toString();
  html.window.open(url, '_blank');
  return true;
}
