import java.net.*;
import java.util.Scanner;

public class Question11 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter IP addresses: ");
        String[] ipAddresses = scanner.nextLine().split(";\\s*"); 
        System.out.println("IP Address           Host Name");
        for (String ipAddress : ipAddresses) {
            try {
                InetAddress address = InetAddress.getByName(ipAddress.trim());
                String hostName = address.getHostName();
                if (hostName.equals(ipAddress)) {
                    System.out.println("Unresolvable IP: " + ipAddress);
                } else {
                    System.out.println(ipAddress + " -> " + hostName);
                }
            } catch (UnknownHostException e) {
                System.out.println("Unresolvable IP: " + ipAddress);
            }
        }
        scanner.close();
    }
}
