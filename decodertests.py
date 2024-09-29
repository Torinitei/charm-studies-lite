testGrid = [2, 2, 1, 2, 2], [2, 1, 1, 1, 2], [1, 1, 1, 1, 1], [2, 1, 1, 1, 2], [2, 2, 1, 2, 2]

testSeed = ''

def encode(grid):
    seed = ''
    seedlist = []

    seedlist.append(len(grid[1]))

    currentBit = 1
    currentCount = 0

    for i in testGrid:
        for j in i:
            #print(f"{j} | {currentBit} | {currentCount}")
            if j == currentBit:
                #print("same")
                currentCount += 1
            else:
                if currentBit == 1:
                    currentBit = 2
                else:
                    currentBit = 1
                
            if currentCount != 0:
                seedlist.append(currentCount)
                currentCount = 0
                
            #print(f"{j} | {currentBit} | {currentCount}")

    return seedlist

def decode(seed):
    pass


print(encode(testGrid))