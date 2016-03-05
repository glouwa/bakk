#include <math.h>
#include <iostream>
#include <cstdlib>

#define true  1
#define false 0
#define uint64 unsigned long long

bool isPrime(uint64 n)
{
    if (n < 2)
        return false;

    uint64 m = sqrt(n);
    for (uint64 i = 2; i <= m; i++)
        if (n%i == 0)
            return false;

    return true;
}

int main(int argc, char** argv)
{
    uint64 begin = std::atoi(argv[1]);
    uint64 end = std::atoi(argv[2]);
    uint64 count = end-begin;

    for (uint64 i = begin; i <= end; ++i)
        if (isPrime(i))
            std::cout
                << "{"
                << "   \"state\": {"
                << "      \"progress\": " << 0.05 + ((float)(i-begin))/count*0.9 << ","
                << "      \"log\": "      << "\"checked " << begin << "-" << i << "\""
                << "   },"
                << "   \"output\": " << i
                << "}";
    return 0;
}
