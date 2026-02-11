import 'package:otp/otp.dart';

class OtpService {
  
  /// Generates the current 6-digit TOTP code for a given secret
  static String generateTotp(String secret) {
    // RFC 6238 time-based OTP
    // Default 30s interval
    try {
      return OTP.generateTOTPCodeString(
        secret, 
        DateTime.now().millisecondsSinceEpoch, 
        interval: 30,
        length: 6,
        algorithm: Algorithm.SHA1,
        isGoogle: true // Google Authenticator compatibility (base32)
      );
    } catch (e) {
      return "ERROR";
    }
  }

  /// Returns the remaining seconds in the current 30s window
  static int getRemainingSeconds() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final epoch = now ~/ 1000;
    return 30 - (epoch % 30);
  }
}
