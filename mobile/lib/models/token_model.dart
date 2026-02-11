import 'dart:convert';

class TokenModel {
  final String id;
  final String issuer;
  final String accountName;
  final String secret; // This is sensitive!
  final DateTime createdAt;
  // In a real app, you might not store the secret in this model if it's serialized to plain disk.
  // But for MVP, we will manage this carefully.

  TokenModel({
    required this.id,
    required this.issuer,
    required this.accountName,
    required this.secret,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'issuer': issuer,
      'accountName': accountName,
      'secret': secret,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory TokenModel.fromMap(Map<String, dynamic> map) {
    return TokenModel(
      id: map['id'],
      issuer: map['issuer'],
      accountName: map['accountName'],
      secret: map['secret'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }

  String toJson() => json.encode(toMap());

  factory TokenModel.fromJson(String source) => TokenModel.fromMap(json.decode(source));
}
