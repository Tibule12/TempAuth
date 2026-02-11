import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../models/token_model.dart';

class StorageService {
  // Create storage
  final _storage = const FlutterSecureStorage();
  
  static const _keyTokens = 'temp_auth_tokens';

  Future<List<TokenModel>> getTokens() async {
    final String? tokensJson = await _storage.read(key: _keyTokens);
    if (tokensJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(tokensJson);
    return decoded.map((e) => TokenModel.fromMap(e)).toList();
  }

  Future<void> saveToken(TokenModel newToken) async {
    List<TokenModel> currentTokens = await getTokens();
    
    // Check for duplicates
    // In a real app, handle overwrites or errors
    currentTokens.add(newToken);
    
    final String encoded = jsonEncode(currentTokens.map((e) => e.toMap()).toList());
    await _storage.write(key: _keyTokens, value: encoded);
  }

  Future<void> deleteToken(String id) async {
    List<TokenModel> currentTokens = await getTokens();
    currentTokens.removeWhere((t) => t.id == id);
    
    final String encoded = jsonEncode(currentTokens.map((e) => e.toMap()).toList());
    await _storage.write(key: _keyTokens, value: encoded);
  }
}
